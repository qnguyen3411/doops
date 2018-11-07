import re
import bcrypt
from django.db import models
from django.db.models import Count


# Create your models here.
class UserManager(models.Manager):
    def clean_input(self, postData):
        cleanData = {}
        if 'username' in postData:
            cleanData['username'] = postData['username'].strip()
        if 'password' in postData:
            cleanData['password'] = postData['password'].strip()
        if 'old_password' in postData:
            cleanData['old_password'] = postData['password'].strip()
        if 'confirm' in postData:
            cleanData['confirm'] = postData['confirm'].strip()
        return cleanData

    def validate_name(self, postData, min_length=0, max_length=20, check_unique=True):
        errors = []
        if (
            len(postData['username']) < min_length
            or len(postData['username']) > max_length):
            errors.append({
                'tag':'username',
                'message':
                    ('username must be between {0} and {1} characters.'
                    .format(min_length, max_length)
                    )
                })
        elif check_unique:
            user_list = User.objects.filter(username=postData['username'])
            if user_list:
                errors.append({'tag':'username','message': 'Username already in use'})
        return errors
    

    def validate_password(self, postData, min_length=0, check_confirm=True):
        errors = []
        if len(postData['password']) < min_length:
            errors.append({
                'tag':'password',
                'message': 'Password must be at least '+str(min_length)+' characters.'})
        elif check_confirm and postData['password'] != postData['confirm']:
            errors.append({
                'tag':'password',
                'message': 'Password must match password confirm.'})
        return errors


    def login(self, user_input):
        """
        Accepts login form inputs. If form is valid, return logged in user,
        else, return a list of errors
        """
        postData = User.objects.clean_input(user_input)

        errors = (User.objects.validate_name(postData, min_length=2, check_unique=False) 
        + User.objects.validate_password(postData, min_length=8, check_confirm=False))
        if not len(errors):
            user_list = User.objects.filter(username=postData['username'])
            if user_list:
                if bcrypt.checkpw(postData['password'].encode(), user_list[0].password_hash.encode()):
                    return {'user': user_list[0]}
        return {'errors' : [{'tag':'login', 'message': "Username/password invalid"}]}


    def register(self, user_input):
        """
        Accepts register form inputs. If form is valid, register and
        return registered user, else, return a list of errors
        """
        postData = User.objects.clean_input(user_input)

        errors = (User.objects.validate_name(postData, min_length=2) 
                + User.objects.validate_password(postData, min_length=8)
                )
        if not len(errors):
            pw_hash = bcrypt.hashpw(postData['password'].encode(), bcrypt.gensalt())

            user = User.objects.create(
                username = postData['username'],
                password_hash = pw_hash
            )
            return {'user': user}
        return {'errors' : errors}

    def delete_user(self, this_user, as_admin=False, pw_validation={}):
        valid = False;

        if not as_admin:
            if 'password' in pw_validation:
                if bcrypt.checkpw(pw_validation['password'].encode(), this_user.password_hash.encode()):
                    valid = True
        if as_admin or valid:
            return {'deleted_user': this_user.delete()}
        return {'errors': [{'tag':'delete', 'message': "Delete unsuccessful"}]}



    
class User(models.Model):
    username = models.CharField(max_length=255)
    password_hash = models.CharField(max_length=255)
    user_level = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    def is_admin(self):
        return self.user_level == 9;

    def update(self, user_input):
        check_unique = True
        errors = []
        postData = User.objects.clean_input(user_input)
        update_username = False
        update_pw = False
        if 'username' in postData:
            update_username = True

            #if user is leaving the name as is, don't check for uniqueness
            if postData['username'] == self.username:
                check_unique = False
            errors += User.objects.validate_name(postData, min_length=2, check_unique=check_unique) 

        if set(['old_password','password','confirm']).issubset(set(postData)):
            update_pw = True
            errors += User.objects.validate_password(postData, min_length=8)
            if bcrypt.checkpw(postData['old_password'].encode(), self.password_hash.encode()):
                errors += [{'tag': 'old_password', 'message': 'Old password invalid'}]
                
        if not len(errors):
            if update_username:
                self.username = postData['username']
            if update_pw:
                self.password_hash = bcrypt.hashpw(postData['password'].encode(), bcrypt.gensalt())
            self.save()
            return {'user':self}
        return {'errors': errors}


class CanvasNodeManager(models.Manager):
    def get_canvas_list(self, **kwargs):
        # Default arguments
        user_id = kwargs.pop('user_id', None)
        node_id = kwargs.pop('node_id', None)

        if user_id: 
            user_id = int(user_id)
            mode = kwargs.pop('mode', 'post')
        elif node_id:
            node_id = int(node_id)
            mode = kwargs.pop('mode', 'self')
        else:
            mode = kwargs.pop('mode', 'all')

        sort = kwargs.pop('sort', 'new')
        
        # Parse into strings
        mode = "".join(mode)
        sort = "".join(sort)

        canvas_list = CanvasNode.objects.all()

        if mode == 'root':
            canvas_list = CanvasNode.objects.filter(parent = None)
        
        if user_id:
            users = User.objects.filter(id = user_id)
            if users:
                if mode == 'post':
                    canvas_list = canvas_list.filter(poster__id = user_id)
                elif mode == 'watch':
                    canvas_list = canvas_list.filter(watched_users__id = user_id)

        elif node_id:
            nodes = canvas_list.filter(id = node_id)
            if nodes:
                node = nodes[0]
                if mode == 'children':
                    canvas_list = node.children.all()
                    print(canvas_list)

                elif mode == 'parent':
                    if node.parent:
                        canvas_list = CanvasNode.objects.filter(id = node.parent.id)
                    else:
                        canvas_list = CanvasNode.objects.none()
                elif mode == 'siblings':
                    canvas_list = node.get_siblings()
                elif mode == 'ancestors':
                    canvas_list = node.get_ancestors()
                elif mode == 'descendants':
                    canvas_list = node.get_descendants()
                else:
                    canvas_list = nodes

        if sort == 'new':
            canvas_list = canvas_list.order_by('-id')
        elif sort == 'old':
            canvas_list = canvas_list.order_by('id')
        elif sort == 'popular':
            canvas_list = (canvas_list.annotate(
                num_watchers = Count('watched_users'))
                .order_by('-num_watchers'))
        
        return canvas_list


class CanvasNode(models.Model):
    image = models.ImageField(blank=True)
    poster = models.ForeignKey(
                            User, 
                            on_delete=models.SET_NULL,
                            related_name="posted_canvases",
                            blank=True,
                            null=True)
    watched_users = models.ManyToManyField(User, related_name="watched_canvases")
    parent = models.ForeignKey(
                            "self",
                            related_name = "children",
                            blank=True,
                            null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CanvasNodeManager()

    def is_root(self):
        return self.parent == None;

    def by_anonymous(self):
        return self.poster == None;

    def num_descendants(self):
        count = 0
        for child in self.children.all():
            count += 1
            count += child.num_descendants()
        return count

    def get_descendants(self):
        descendant_list = self.children.all()
        children_list = descendant_list
        for child in children_list:
            descendant_list = descendant_list | child.get_descendants()

        return descendant_list

    def total_watches(self):
        count = 0
        count += self.watched_users.all().count()
        for child in self.children.all():
            count += child.total_watches()
        return count

    def get_generation(self):
        if self.parent == None:
            return 0
        return (self.parent.get_generation() + 1)

    def get_ancestors(self):
        ancestors_plus_self = self.get_ancestors_recursive()
        return ancestors_plus_self.exclude(id = self.id)
    

    def get_ancestors_recursive(self):
        if self.parent == None:
            return CanvasNode.objects.filter(id = self.id)
        return (CanvasNode.objects.filter(id = self.id) | self.parent.get_ancestors_recursive())
    
    def get_siblings(self):
        if self.parent == None:
            return CanvasNode.objects.none()
        else:
            return self.parent.children.exclude(id = self.id)


class NotificationManager(models.Manager):
    def send_noti_for_new_canvas(self, new_canvas):
        if new_canvas.parent.poster:
            Notification.objects.create(
                notified_user = new_canvas.parent.poster,
                new_canvas = new_canvas,
                user_status = "P"
            )
        for watcher in new_canvas.parent.watched_users.all():
            Notification.objects.create(
                notified_user = watcher,
                new_canvas = new_canvas,
                user_status = "P"
            )
        return self;


class Notification(models.Model):
    POSTER = 'P'
    WATCHER = 'W'
    USER_STATUS_CHOICES = (
        (POSTER, 'Poster'),
        (WATCHER, 'Watcher')
    )
    notified_user = models.ForeignKey(User, related_name="user_notifications")
    new_canvas = models.ForeignKey(CanvasNode, related_name="canvas_notifications")
    user_status = models.CharField(
        max_length=1,
        choices= USER_STATUS_CHOICES,
        default=POSTER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = NotificationManager()

class ReportManager(models.Manager):
    def validate_report(self, postData):
        if 'reported_canvas_id' in postData:
            reported_canvas_id = int(postData['reported_canvas_id'])
            dupes_list = Report.objects.filter(
                reported_canvas__id=reported_canvas_id
            )
            if dupes_list:
                return False;
        return True;


class Report(models.Model):
    description = models.TextField(blank=True, null=True)
    reported_canvas = models.OneToOneField(CanvasNode, blank=True, null=True)
    reporter = models.OneToOneField(User, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
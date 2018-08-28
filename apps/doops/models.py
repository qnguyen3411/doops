import re
from django.db import models
from django.core.files.storage import FileSystemStorage


EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$')

# Create your models here.
class UserManager(models.Manager):
    def clean_input(self, postData):
        # if form_register:
        cleanData = {}
        if 'username' in postData:
            cleanData['username'] = postData['username'].strip()
        if 'email' in postData:
            cleanData['email'] = postData['email'].strip().lower()
        if 'password' in postData:
            cleanData['password'] = postData['password'].strip()
        if 'confirm' in postData:
            cleanData['confirm'] = postData['confirm'].strip()
        return cleanData

    def validate_name(self, postData, min_length=0):
        errors = []
        if len(postData['username']) < min_length:
            errors.append({
                'tag':'username',
                'message': 'username must be at least '+str(min_length)+' characters.'})
        return errors

    def validate_email(self, postData, check_unique=True):
        errors = []
        if not EMAIL_REGEX.match(postData['email']):
            errors.append({'tag':'email','message': 'Invalid email'})
        elif check_unique:
            user_list = User.objects.filter(email=postData['email'])
            if user_list:
                errors.append({'tag':'email','message': 'Email already in use'})
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

    


class User(models.Model):
    username = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    password_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()


# class CanvasNodeManager(models.Manager):


class CanvasNode(models.Model):
    image = models.ImageField(blank=True)
    poster = models.ForeignKey(User, related_name="posted_canvases")
    watched_users = models.ManyToManyField(User, related_name="watched_canvases")
    parent = models.ForeignKey("self", related_name = "children",blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_root(self):
        return self.parent == None;

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
        if self.parent == None:
            return CanvasNode.objects.filter(id = self.id)
        return (CanvasNode.objects.filter(id = self.id) | self.parent.get_ancestors())
    
    def get_siblings(self):
        if self.parent == None:
            return CanvasNode.objects.none()
        else:
            return self.parent.children.exclude(id = self.id)

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
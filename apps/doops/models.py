from django.db import models
import re

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$')

# Create your models here.
class UserManager(models.Manager):
    def clean_input(self, postData, form_login=False, form_register=False, form_edit=False):
        if form_register:
            cleanData = {
                'username' : postData['username'].strip(),
                'email' : postData['email'].strip().lower(),
                'password' : postData['password'].strip(),
                'confirm' : postData['confirm'].strip(),
            }
        elif form_login:
            cleanData = {
                'email' : postData['email'].strip().lower(),
                'password' : postData['password'].strip(),
            }
        else:
            cleanData = {
                'username' : postData['first_name'].strip(),
                'email' : postData['email'].strip().lower(),
            }
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


class CanvasNode(models.Model):
    data_url = models.TextField()
    poster = models.ForeignKey(User, related_name="posted_canvases")
    watched_users = models.ManyToManyField(User, related_name="watched_canvases")
    parent = models.ForeignKey("self", related_name = "children",blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def isRoot(self):
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
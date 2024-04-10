from django.db import models

class User(models.Model):
    uid = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    role = models.CharField(max_length=50)

class Assignment(models.Model):
    aid = models.AutoField(primary_key=True)
    assignment_name = models.CharField(max_length=100)

class Grade(models.Model):
    gid = models.AutoField(primary_key=True)
    uid = models.ForeignKey(User, on_delete=models.CASCADE)
    aid = models.ForeignKey(Assignment, on_delete=models.CASCADE)
    marks = models.IntegerField()
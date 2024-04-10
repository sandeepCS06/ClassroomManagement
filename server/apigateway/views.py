from django.shortcuts import render
from .models import User, Assignment , Grade
from .serializers import UserSerializer, AssignmentSerializer, GradeSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg

# Create your views here.

# url/register 
@api_view(['POST'])
def register(request):    
    username = request.data.get('username')  
    password = request.data.get('password')
    role = request.data.get('role')

    if not (username and password and role):  
        return Response({'message': 'Username, password and role are required'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create(username=username, password=password, role=role)
    user_data = UserSerializer(user).data
    return Response({'message': 'User created successfully', 'user': user_data}, status=status.HTTP_201_CREATED)

# url/login
@api_view(['GET','POST'])
def login(request):
    if(request.method == 'GET'):
        # return all users
        users = User.objects.all()
        users_data = UserSerializer(users, many=True).data
        return Response({'message': 'Users fetched successfully', 'users': users_data}, status=status.HTTP_200_OK)

    elif (request.method == 'POST'):

        username = request.data.get('username')
        password = request.data.get('password')

        if not (username and password):
            return Response({'message': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=username, password=password).first()

        if not user:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        user_data = UserSerializer(user).data
        return Response({'message': 'User logged in successfully', 'user': user_data}, status=status.HTTP_200_OK)

# url/assignments
@api_view(['GET','POST'])
def assignments(request):
    
    if request.method == 'GET':
        assignments = Assignment.objects.all()
        assignments_data = AssignmentSerializer(assignments, many=True).data

        # Iterate over each assignment data
        for assignment_data in assignments_data:
            assignment_id = assignment_data['aid']
            assignment = Assignment.objects.get(aid=assignment_id)
            highest_marks = Grade.objects.filter(aid=assignment).order_by('-marks').first()
            assignment_data['highest_marks'] = highest_marks.marks if highest_marks else None
            lowest_marks = Grade.objects.filter(aid=assignment).order_by('marks').first()
            assignment_data['lowest_marks'] = lowest_marks.marks if lowest_marks else None

            # Calculate average marks using Django's ORM aggregate function
            average_marks = Grade.objects.filter(aid=assignment).aggregate(avg_marks=Avg('marks'))
            assignment_data['average_marks'] = average_marks['avg_marks'] if average_marks['avg_marks'] else None

            # Count the number of grades for this assignment
            count = Grade.objects.filter(aid=assignment).count()
            assignment_data['grade_count'] = count

        return Response({'message': 'Assignments fetched successfully', 'assignments': assignments_data}, status=status.HTTP_200_OK)
    
    elif (request.method == 'POST'):
        assignment_name = request.data.get('assignment_name')

        if not assignment_name:  
            return Response({'message': 'Assignment name is required'}, status=status.HTTP_400_BAD_REQUEST)

        assignment = Assignment.objects.create(assignment_name=assignment_name)
        assignment_data = AssignmentSerializer(assignment).data
        return Response({'message': 'Assignment created successfully', 'assignment': assignment_data}, status=status.HTTP_201_CREATED)

# url/grades/assignment/aid
@api_view(['GET','POST'])
def grades_assignment(request , aid):
    if(request.method == 'GET'):
        grades = Grade.objects.filter(aid=aid)
        grades_data = GradeSerializer(grades, many=True).data

        # append username to grades_data
        for grade in grades_data:
            user = User.objects.get(uid=grade['uid'])
            grade['username'] = user.username
        return Response({'message': 'Grades fetched successfully', 'grades': grades_data}, status=status.HTTP_200_OK)
    
    elif (request.method == 'POST'):
        # ADD GRADE / UPDATE GRADE
        uid = request.data.get('uid')
        marks = request.data.get('marks')

        print(type(uid))
        print(type(marks))

        print(uid,marks)        
        if not (uid and marks):
            return Response({'message': 'User id and marks are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(uid= uid)
            assignment = Assignment.objects.get(aid=aid)
        except User.DoesNotExist:
            return Response({'message': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        print(user,assignment)
        
        grade, created = Grade.objects.get_or_create(uid=user, aid=assignment, defaults={'marks': marks})  
        grade.marks = marks
        grade.save()
        grade_data = GradeSerializer(grade).data

        if created:
            return Response({'message': 'Grade created successfully', 'grade': grade_data}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Grade updated successfully', 'grade': grade_data}, status=status.HTTP_200_OK)
        
# url/grades/user/uid
@api_view(['GET'])
def grades_user(request , uid):
    if(request.method == 'GET'):
        grades = Grade.objects.filter(uid=uid)
        grades_data = GradeSerializer(grades, many=True).data

        # append assignment name to grades_data
        for grade in grades_data:
            assignment = Assignment.objects.get(aid=grade['aid'])
            grade['assignment_name'] = assignment.assignment_name

            user = User.objects.get(uid=grade['uid'])
            grade['username'] = user.username
        

            assignment = Assignment.objects.get(aid=grade['aid'])
            highest_marks = Grade.objects.filter(aid=assignment).order_by('-marks').first()
            grade['highest_marks'] = highest_marks.marks
            lowest_marks = Grade.objects.filter(aid=assignment).order_by('marks').first()
            grade['lowest_marks'] = lowest_marks.marks

            # Calculate average marks using Django's ORM aggregate function
            average_marks = Grade.objects.filter(aid=assignment).aggregate(avg_marks=Avg('marks'))
            grade['average_marks'] = average_marks['avg_marks']
    
            assignment = Assignment.objects.get(aid=grade['aid'])
            count = Grade.objects.filter(aid=assignment).count()
            grade['count'] = count

            # add total_assignmets
            total_assignments = Assignment.objects.all().count()
            grade['total_assignments'] = total_assignments

        # append a

        return Response({'message': 'Grades fetched successfully', 'grades': grades_data}, status=status.HTTP_200_OK)
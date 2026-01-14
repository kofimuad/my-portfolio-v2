from datetime import datetime
from pydantic import BaseModel
from typing import Optional

# Blog Models
class BlogBase(BaseModel):
    title: str
    content: str
    excerpt: str

class BlogCreate(BlogBase):
    pass

class Blog(BlogBase):
    id: str
    created_at: datetime
    updated_at: datetime

# Project Models
class ProjectBase(BaseModel):
    title: str
    description: str
    image_url: str
    github_link: str

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime

# About Models
class AboutBase(BaseModel):
    bio: str
    skills: list[str]
    hobbies: list[str]

class About(AboutBase):
    id: str
    updated_at: datetime

# Contact Models
class ContactBase(BaseModel):
    name: str
    email: str
    message: str

class Contact(ContactBase):
    id: str
    created_at: datetime

# Auth Models
class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
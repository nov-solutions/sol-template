export default function DatabasePage() {
  return (
    <div>
      <h1>Database</h1>
      <p className="lead">
        Sol uses PostgreSQL as its primary database with Django ORM for data
        modeling and migrations.
      </p>

      <h2>Configuration</h2>
      <p>
        Database settings are configured via environment variables in your{" "}
        <code>.env</code> file:
      </p>

      <pre>
        <code>{`POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=sol
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password`}</code>
      </pre>

      <h2>Models</h2>
      <p>Sol includes these core models:</p>

      <h3>User Model</h3>
      <pre>
        <code>{`# web/user/models.py
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    password = models.CharField(max_length=255, null=True, blank=True)
    email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []`}</code>
      </pre>

      <h3>Subscription Model</h3>
      <pre>
        <code>{`# web/stripeapp/models.py
class Subscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    stripe_customer_id = models.CharField(max_length=255)
    stripe_subscription_id = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=50)
    current_period_end = models.DateTimeField(null=True)
    cancel_at_period_end = models.BooleanField(default=False)`}</code>
      </pre>

      <h2>Migrations</h2>
      <p>Django migrations are managed through Make commands:</p>

      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>make mk-mig</code>
            </td>
            <td>Create and apply migrations</td>
          </tr>
          <tr>
            <td>
              <code>make init-mig</code>
            </td>
            <td>Initialize migrations for core apps</td>
          </tr>
          <tr>
            <td>
              <code>make drop-db</code>
            </td>
            <td>Reset database (destroys all data)</td>
          </tr>
        </tbody>
      </table>

      <h3>Creating Migrations</h3>
      <p>After modifying a model:</p>

      <pre>
        <code>{`# Create migration files
make mk-mig

# Or manually inside the container
docker exec -it sol-web-django python manage.py makemigrations
docker exec -it sol-web-django python manage.py migrate`}</code>
      </pre>

      <h2>Creating New Models</h2>
      <p>To add a new model to your application:</p>

      <ol>
        <li>Create a new Django app or add to an existing one:</li>
      </ol>

      <pre>
        <code>{`# Inside the Django container
cd /app
python manage.py startapp myapp`}</code>
      </pre>

      <ol start={2}>
        <li>
          Define your model in <code>myapp/models.py</code>:
        </li>
      </ol>

      <pre>
        <code>{`from django.db import models
from user.models import User

class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name`}</code>
      </pre>

      <ol start={3}>
        <li>
          Add the app to <code>INSTALLED_APPS</code> in{" "}
          <code>settings/components/base.py</code>
        </li>
        <li>
          Run <code>make mk-mig</code> to create and apply migrations
        </li>
      </ol>

      <h2>Database Access</h2>
      <p>Connect directly to PostgreSQL for debugging:</p>

      <pre>
        <code>{`# Via Docker
docker exec -it sol-web-db-postgres psql -U postgres -d sol

# Common commands
\\dt           # List tables
\\d tablename  # Describe table
SELECT * FROM user_user;`}</code>
      </pre>

      <h2>Django Admin</h2>
      <p>
        Register models in <code>admin.py</code> to manage them via the Django
        admin interface at <code>/api/admin/</code>.
      </p>

      <pre>
        <code>{`# myapp/admin.py
from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["name", "owner", "created_at"]
    search_fields = ["name", "owner__email"]`}</code>
      </pre>

      <h2>Query Optimization</h2>
      <p>Tips for efficient database queries:</p>

      <pre>
        <code>{`# Use select_related for foreign keys
Project.objects.select_related("owner").all()

# Use prefetch_related for reverse relations
User.objects.prefetch_related("project_set").all()

# Only fetch needed fields
Project.objects.only("name", "created_at").all()`}</code>
      </pre>

      <h2>Next Steps</h2>
      <ul>
        <li>
          Learn about <a href="/docs/api-routes">API Routes</a>
        </li>
        <li>
          Configure <a href="/docs/background-jobs">Background Jobs</a>
        </li>
      </ul>
    </div>
  );
}

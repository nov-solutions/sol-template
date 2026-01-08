export default function APIRoutesPage() {
  return (
    <div>
      <h1>API Routes</h1>
      <p className="lead">
        Sol uses Django REST Framework to build a RESTful API that the Next.js
        frontend consumes.
      </p>

      <h2>URL Structure</h2>
      <p>
        All API routes are prefixed with <code>/api/</code> and routed through
        Nginx to Django.
      </p>

      <pre>
        <code>{`# web/web/urls.py
urlpatterns = [
    path("api/admin/", admin.site.urls),
    path("api/auth/", include("authapi.urls")),
    path("api/stripe/", include("stripeapp.urls")),
    path("api/health/", include("core.urls")),
    path("api/docs/", include("spectacular.urls")),
]`}</code>
      </pre>

      <h2>Creating API Endpoints</h2>
      <p>
        Django REST Framework provides several ways to create API endpoints:
      </p>

      <h3>Function-Based Views</h3>
      <pre>
        <code>{`from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_endpoint(request):
    return Response({"message": "Hello, World!"})`}</code>
      </pre>

      <h3>Class-Based Views</h3>
      <pre>
        <code>{`from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class MyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "Hello!"})

    def post(self, request):
        data = request.data
        return Response({"received": data})`}</code>
      </pre>

      <h3>ViewSets with Routers</h3>
      <pre>
        <code>{`from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Project
from .serializers import ProjectSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)`}</code>
      </pre>

      <pre>
        <code>{`# urls.py
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")

urlpatterns = router.urls`}</code>
      </pre>

      <h2>Serializers</h2>
      <p>
        Serializers convert complex data types to JSON and validate input data:
      </p>

      <pre>
        <code>{`from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = Project
        fields = ["id", "name", "description", "owner_email", "created_at"]
        read_only_fields = ["id", "created_at"]`}</code>
      </pre>

      <h2>Authentication</h2>
      <p>
        API endpoints use session authentication. The frontend includes the
        session cookie automatically through the Axios client.
      </p>

      <pre>
        <code>{`# Permission classes
from rest_framework.permissions import IsAuthenticated, AllowAny

class PublicView(APIView):
    permission_classes = [AllowAny]  # No auth required

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]  # Auth required`}</code>
      </pre>

      <h2>CSRF Protection</h2>
      <p>
        All non-GET requests require a CSRF token. The frontend handles this
        automatically:
      </p>

      <pre>
        <code>{`// Frontend: lib/axios.ts
const axiosClient = axios.create({
  baseURL: "/api",
  withCredentials: true,  // Include cookies
});

// CSRF token is read from cookie and added to headers
axiosClient.interceptors.request.use((config) => {
  const csrfToken = getCookie("csrftoken");
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});`}</code>
      </pre>

      <h2>Error Handling</h2>
      <p>Return appropriate HTTP status codes and error messages:</p>

      <pre>
        <code>{`from rest_framework import status
from rest_framework.response import Response

def my_view(request):
    if not valid_data:
        return Response(
            {"error": "Invalid data provided"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not has_permission:
        return Response(
            {"error": "Permission denied"},
            status=status.HTTP_403_FORBIDDEN
        )

    return Response({"success": True})`}</code>
      </pre>

      <h2>API Documentation</h2>
      <p>
        Sol uses drf-spectacular to generate OpenAPI documentation. Access it
        at:
      </p>
      <ul>
        <li>
          <code>/api/docs/</code> - Swagger UI
        </li>
        <li>
          <code>/api/docs/schema/</code> - OpenAPI schema (JSON)
        </li>
      </ul>

      <p>Document your endpoints with docstrings:</p>

      <pre>
        <code>{`from drf_spectacular.utils import extend_schema

class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user projects.
    """

    @extend_schema(
        summary="List all projects",
        description="Returns all projects owned by the current user.",
    )
    def list(self, request):
        ...`}</code>
      </pre>

      <h2>Testing API Endpoints</h2>
      <pre>
        <code>{`# Using curl
curl -X GET http://localhost/api/health/

# With authentication (get session first)
curl -X POST http://localhost/api/auth/login/ \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "password"}' \\
  -c cookies.txt

curl -X GET http://localhost/api/projects/ \\
  -b cookies.txt`}</code>
      </pre>

      <h2>Next Steps</h2>
      <ul>
        <li>
          Configure <a href="/docs/background-jobs">Background Jobs</a>
        </li>
        <li>
          Set up <a href="/docs/stripe-setup">Stripe Payments</a>
        </li>
      </ul>
    </div>
  );
}

# Serverless Container running the nginx image that serves the static export.
resource "scaleway_container_namespace" "main" {
  name        = var.app_name
  region      = var.region
  project_id  = var.project_id
  description = "revises-tes-tables Serverless Containers namespace"
}

resource "scaleway_container" "app" {
  name         = "${var.app_name}-web"
  namespace_id = scaleway_container_namespace.main.id
  region       = var.region
  description  = "Static site: Next.js export served by nginx"

  # Immutable tag per deploy: changing image_tag triggers a redeploy, and a
  # rollback is just a previous tag.
  image = "${scaleway_registry_namespace.main.endpoint}/web:${var.image_tag}"

  port     = 8080
  protocol = "http1"
  privacy  = "public"

  min_scale = var.min_scale
  max_scale = var.max_scale

  # Smallest tier (128 MB / 70 mvCPU). Scaleway stores memory in 10^6 units:
  # the decimal value avoids a spurious diff on every plan.
  cpu_limit          = 70
  memory_limit_bytes = 128000000

  # Sandbox v2: faster cold starts (gVisor). nginx needs no exotic syscall.
  sandbox = "v2"

  # Redirect plain HTTP to HTTPS at the edge.
  https_connections_only = true

  liveness_probe {
    http {
      path = "/healthz"
    }
    failure_threshold = 3
    interval          = "10s"
    timeout           = "5s"
  }
}

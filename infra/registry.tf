# Private Container Registry namespace holding the application images.
# Images are pushed by the deploy pipeline as web:<git-sha> and web:latest.
# The endpoint is deterministic: rg.<region>.scw.cloud/<name>.
resource "scaleway_registry_namespace" "main" {
  name        = var.app_name
  region      = var.region
  project_id  = var.project_id
  is_public   = false
  description = "Container images for revises-tes-tables"
}

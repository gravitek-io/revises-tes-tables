# Scaleway provider. Credentials are read from the environment
# (SCW_ACCESS_KEY, SCW_SECRET_KEY) and never stored in code or state inputs.
provider "scaleway" {
  project_id = var.project_id
  region     = var.region
}

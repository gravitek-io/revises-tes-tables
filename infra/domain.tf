# Custom domain with Scaleway-managed TLS.
#
# PREREQUISITE: the CNAME `revises-tes-tables.gravitek.io -> <container_endpoint>`
# must resolve at Infomaniak before this resource is applied, otherwise the
# binding fails. On the first deploy the pipeline is run with
# enable_custom_domain=false, the CNAME is created by hand, then a normal run
# binds the domain. See README.md.
resource "scaleway_container_domain" "app" {
  count = var.enable_custom_domain ? 1 : 0

  container_id = scaleway_container.app.id
  hostname     = var.hostname
  region       = var.region
}

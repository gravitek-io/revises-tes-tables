output "registry_endpoint" {
  description = "Container Registry endpoint (image prefix)."
  value       = scaleway_registry_namespace.main.endpoint
}

output "container_endpoint" {
  description = "Native container hostname: the target of the CNAME at Infomaniak."
  value       = trimprefix(scaleway_container.app.public_endpoint, "https://")
}

output "container_url" {
  description = "Native HTTPS URL of the container (always reachable, used by the smoke test)."
  value       = scaleway_container.app.public_endpoint
}

output "public_url" {
  description = "URL visitors use: the custom domain when bound, the native URL otherwise."
  value       = var.enable_custom_domain ? "https://${var.hostname}" : scaleway_container.app.public_endpoint
}

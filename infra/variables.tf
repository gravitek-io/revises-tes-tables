variable "project_id" {
  description = "Scaleway project dedicated to this application."
  type        = string
  default     = "7b8f19b7-3895-43d5-a9e5-0fefa17a0be9"
}

variable "region" {
  description = "Scaleway region for all regional resources."
  type        = string
  default     = "fr-par"
}

variable "app_name" {
  description = "Base name for the registry namespace, container namespace and container."
  type        = string
  default     = "revises-tes-tables"
}

variable "hostname" {
  description = "Custom domain served by the container (CNAME to the container endpoint, managed at Infomaniak)."
  type        = string
  default     = "revises-tes-tables.gravitek.io"
}

variable "image_tag" {
  description = "Immutable image tag to deploy (the git commit SHA). Set by the pipeline."
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z0-9_.-]+$", var.image_tag))
    error_message = "image_tag must be a valid Docker tag (letters, digits, '_', '.', '-')."
  }
}

variable "enable_custom_domain" {
  description = "Bind the custom hostname to the container. Set to false on the very first deploy: the CNAME cannot exist before the container endpoint is known."
  type        = bool
  default     = true
}

variable "min_scale" {
  description = "Minimum number of instances. 0 = scale to zero (idle cost near zero, ~1s cold start)."
  type        = number
  default     = 0
}

variable "max_scale" {
  description = "Maximum number of instances under load."
  type        = number
  default     = 2
}

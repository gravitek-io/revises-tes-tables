# Terraform settings: version floor, provider, and remote state backend.
#
# State lives in a private Scaleway Object Storage bucket (S3-compatible) created
# once during the manual bootstrap (see README.md). It is not managed here
# (chicken-and-egg). Locking uses Terraform's native S3 lockfile, which Scaleway
# supports through conditional writes.
#
# Backend credentials come from AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (set to
# the Scaleway API key by the pipeline). Provider credentials come from
# SCW_ACCESS_KEY / SCW_SECRET_KEY.
terraform {
  required_version = ">= 1.10"

  required_providers {
    scaleway = {
      source  = "scaleway/scaleway"
      version = "~> 2.84"
    }
  }

  backend "s3" {
    bucket = "revises-tes-tables-tfstate"
    key    = "revises-tes-tables/terraform.tfstate"
    region = "fr-par"

    endpoints = {
      s3 = "https://s3.fr-par.scw.cloud"
    }

    use_lockfile = true

    # Scaleway Object Storage is S3-compatible but not AWS: skip AWS-only checks.
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_s3_checksum            = true
  }
}

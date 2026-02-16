# ──────────────────────────────────────────────
# General
# ──────────────────────────────────────────────
variable "project_name" {
  description = "Name of the project – used for tagging and naming resources"
  type        = string
  default     = "python-devops"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

# ──────────────────────────────────────────────
# Networking
# ──────────────────────────────────────────────
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24", "10.0.30.0/24"]
}

variable "availability_zones" {
  description = "Availability Zones to use in us-east-1"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# ──────────────────────────────────────────────
# EC2
# ──────────────────────────────────────────────
variable "ec2_ami_id" {
  description = "Your private AMI ID for the EC2 instance"
  type        = string
  # Supply via terraform.tfvars or -var flag
}

variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.2xlarge"
}

variable "ec2_key_pair_name" {
  description = "Name of the AWS Key Pair to attach to the EC2 instance"
  type        = string
  default     = "python-devops-key"
}

variable "ec2_volume_size" {
  description = "Root EBS volume size in GB"
  type        = number
  default     = 50
}

# ──────────────────────────────────────────────
# EKS
# ──────────────────────────────────────────────
variable "eks_cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "python-devops-eks"
}

variable "eks_cluster_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
  default     = "1.29"
}

variable "eks_node_instance_types" {
  description = "Instance types for EKS managed node group"
  type        = list(string)
  default     = ["t3.2xlarge"]
}

variable "eks_node_desired" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 2
}

variable "eks_node_min" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 1
}

variable "eks_node_max" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 4
}

# ──────────────────────────────────────────────
# SSH access
# ──────────────────────────────────────────────
variable "allowed_ssh_cidrs" {
  description = "CIDR blocks allowed to SSH into the EC2 instance"
  type        = list(string)
  default     = ["0.0.0.0/0"] # restrict in production!
}

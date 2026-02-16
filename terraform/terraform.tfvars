# ──────────────────────────────────────────────────────
# terraform.tfvars – Fill in your values before applying
# ──────────────────────────────────────────────────────

# Your private AMI ID
ec2_ami_id = "ami-017475566b495c386"

# Project settings
project_name = "python-devops"
environment  = "dev"
aws_region   = "us-east-1"

# EC2
ec2_instance_type = "t3.2xlarge"
ec2_key_pair_name = "python-devops-key"
ec2_volume_size   = 50

# EKS
eks_cluster_name        = "python-devops-eks"
eks_cluster_version     = "1.29"
eks_node_instance_types = ["t3.2xlarge"]
eks_node_desired        = 2
eks_node_min            = 1
eks_node_max            = 4

# Networking
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.20.0/24", "10.0.30.0/24"]
availability_zones   = ["us-east-1a", "us-east-1b", "us-east-1c"]

# SSH access – restrict to your IP in production (e.g. ["203.0.113.5/32"])
allowed_ssh_cidrs = ["0.0.0.0/0"]

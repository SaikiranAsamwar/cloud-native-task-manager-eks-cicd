# Terraform – Infrastructure as Code

This folder provisions all AWS infrastructure for the **Python-DevOps** project.

## Architecture

| Resource | Details |
|---|---|
| **VPC** | `10.0.0.0/16` with 3 public + 3 private subnets across `us-east-1a/b/c` |
| **NAT Gateway** | Single NAT in public subnet for cost efficiency |
| **EC2** | `t3.2xlarge` from your private AMI – Jenkins / app server |
| **EKS** | Managed Kubernetes cluster (`1.29`) with `t3.2xlarge` worker nodes |
| **Security Groups** | Separate SGs for EC2, EKS cluster, and EKS nodes |

## Folder Structure

```
terraform/
├── provider.tf          # AWS provider & backend config
├── variables.tf         # All input variables
├── terraform.tfvars     # Your values (AMI, region, etc.)
├── vpc.tf               # VPC, subnets, IGW, NAT, route tables
├── security-groups.tf   # Security groups for EC2 & EKS
├── eks.tf               # EKS cluster, node group, IAM roles
├── ec2.tf               # EC2 instance & key pair
├── outputs.tf           # Useful outputs (IPs, endpoints, commands)
├── .gitignore           # Ignores state, keys, etc.
└── keys/
    └── README.md        # Drop your .pem and .pub here
```

## Prerequisites

1. [Terraform >= 1.5](https://developer.hashicorp.com/terraform/downloads)
2. AWS CLI configured (`aws configure`)
3. Your `.pem` key file

## Quick Start

```bash
cd terraform/

# 1. Place your key files
cp /path/to/your-key.pem keys/python-devops-key.pem
ssh-keygen -y -f keys/python-devops-key.pem > keys/python-devops-key.pub

# 2. Edit terraform.tfvars – set your AMI ID
#    ec2_ami_id = "ami-0abc123..."

# 3. Initialize & apply
terraform init
terraform plan
terraform apply

# 4. Connect to EC2
$(terraform output -raw ssh_command)

# 5. Configure kubectl for EKS
$(terraform output -raw kubeconfig_command)
```

## Tear Down

```bash
terraform destroy
```

## Notes

- **No existing files were modified** – this is a standalone IaC layer.
- The `.gitignore` prevents `.pem` keys and `.tfstate` files from being committed.
- For production, uncomment the S3 backend block in `provider.tf` and restrict `allowed_ssh_cidrs`.

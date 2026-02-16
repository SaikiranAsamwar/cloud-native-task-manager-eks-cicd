# ──────────────────────────────────────────────
# AWS Key Pair (references your .pem file)
# ──────────────────────────────────────────────
resource "aws_key_pair" "deployer" {
  key_name   = var.ec2_key_pair_name
  public_key = file("${path.module}/keys/${var.ec2_key_pair_name}.pub")

  tags = {
    Name = "${var.project_name}-key-pair"
  }
}

# ──────────────────────────────────────────────
# EC2 Instance
# ──────────────────────────────────────────────
resource "aws_instance" "app_server" {
  ami                    = var.ec2_ami_id
  instance_type          = var.ec2_instance_type
  key_name               = aws_key_pair.deployer.key_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.ec2.id]

  associate_public_ip_address = true

  root_block_device {
    volume_size           = var.ec2_volume_size
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  user_data = <<-EOF
    #!/bin/bash
    set -e

    # Update system
    sudo yum update -y 2>/dev/null || sudo apt-get update -y 2>/dev/null

    # Install Docker
    sudo yum install -y docker 2>/dev/null || sudo apt-get install -y docker.io 2>/dev/null
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker ec2-user 2>/dev/null || sudo usermod -aG docker ubuntu 2>/dev/null

    # Install kubectl
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/

    # Install AWS CLI v2
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    sudo ./aws/install
    rm -rf awscliv2.zip aws/

    echo "EC2 bootstrap complete"
  EOF

  tags = {
    Name = "${var.project_name}-app-server"
  }
}

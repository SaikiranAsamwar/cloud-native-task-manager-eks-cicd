Place your .pem private key file and .pub public key file in this directory.

Required files:
  - python-devops-key.pem   (your private key – never commit this)
  - python-devops-key.pub   (your public key – used by Terraform to create the AWS Key Pair)

To generate the .pub from your .pem:
  ssh-keygen -y -f python-devops-key.pem > python-devops-key.pub

These files are git-ignored by the terraform/.gitignore.

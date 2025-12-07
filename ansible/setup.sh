#!/bin/bash
# ================================================================
# ANSIBLE SETUP SCRIPT - Initialize environment and run playbook
# ================================================================
# This script prepares the environment and executes the master playbook
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh
#
# With options:
#   ./setup.sh --dry-run          # Run in check mode (no changes)
#   ./setup.sh --verbose          # Run with verbose output
#   ./setup.sh --tags docker      # Run only specific tags
# ================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INVENTORY_FILE="${SCRIPT_DIR}/inventory.ini"
PLAYBOOK_FILE="${SCRIPT_DIR}/master.yml"

# Variables
DRY_RUN=false
VERBOSE=""
TAGS=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verbose|-v)
            VERBOSE="-vvv"
            shift
            ;;
        --tags)
            TAGS="-t $2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if Ansible is installed
    if ! command -v ansible &> /dev/null; then
        print_error "Ansible is not installed. Install it with: pip3 install ansible"
        exit 1
    fi
    
    # Check if inventory file exists
    if [ ! -f "${INVENTORY_FILE}" ]; then
        print_error "Inventory file not found: ${INVENTORY_FILE}"
        print_info "Please update the inventory.ini file with your EC2 instance IP"
        exit 1
    fi
    
    # Check if playbook file exists
    if [ ! -f "${PLAYBOOK_FILE}" ]; then
        print_error "Playbook file not found: ${PLAYBOOK_FILE}"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Validate inventory
validate_inventory() {
    print_info "Validating inventory..."
    
    # Check if inventory has been configured
    if grep -q "<EC2_MASTER_PUBLIC_IP>" "${INVENTORY_FILE}"; then
        print_error "Inventory file has not been configured!"
        print_info "Please update inventory.ini with your EC2 instance IP:"
        print_info "  1. Replace <EC2_MASTER_PUBLIC_IP> with your instance IP"
        print_info "  2. Replace /path/to/your/key.pem with your SSH key path"
        exit 1
    fi
    
    print_success "Inventory is valid"
}

# Test SSH connectivity
test_connectivity() {
    print_info "Testing SSH connectivity to master node..."
    
    ansible all -i "${INVENTORY_FILE}" -m ping
    
    if [ $? -eq 0 ]; then
        print_success "SSH connectivity successful"
    else
        print_error "Failed to connect to master node"
        print_info "Check your SSH key and EC2 security group settings"
        exit 1
    fi
}

# Run playbook
run_playbook() {
    print_info "Starting ansible playbook execution..."
    
    local cmd="ansible-playbook -i ${INVENTORY_FILE} ${PLAYBOOK_FILE} ${VERBOSE} ${TAGS}"
    
    if [ "${DRY_RUN}" = true ]; then
        cmd="${cmd} --check"
        print_warning "Running in check mode (no changes will be made)"
    fi
    
    eval ${cmd}
    
    if [ $? -eq 0 ]; then
        print_success "Playbook execution completed successfully"
    else
        print_error "Playbook execution failed"
        exit 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  DevOps Master Node Setup - Ansible Automation        ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    check_prerequisites
    validate_inventory
    test_connectivity
    run_playbook
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ Setup Complete!                                    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    print_info "Next steps:"
    echo "  1. SSH into your EC2 instance"
    echo "  2. Access Jenkins at http://<EC2-IP>:8080"
    echo "  3. Access SonarQube at http://<EC2-IP>:9000"
    echo "  4. Access Prometheus at http://<EC2-IP>:9090"
    echo "  5. Access Grafana at http://<EC2-IP>:3000"
    echo ""
}

main "$@"

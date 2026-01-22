#!/bin/bash
# Setup script for deploying the job worker to GCP VM
#
# Run this from your local machine:
#   ./scripts/setup-worker.sh
#
# Prerequisites:
#   - SSH access to gcp-agentic configured in ~/.ssh/config
#   - Project cloned on GCP VM at ~/ritual-research-graph
#   - .env file configured on GCP VM

set -e

SSH_HOST="${SSH_HOST:-gcp-agentic}"
REMOTE_DIR="${REMOTE_DIR:-/home/danielgosek/ritual-research-graph}"
SERVICE_NAME="rrg-worker"

echo "=== Ritual Research Graph - Worker Setup ==="
echo "SSH Host: $SSH_HOST"
echo "Remote Dir: $REMOTE_DIR"
echo ""

# Step 1: Sync the latest code
echo "Step 1: Syncing code to GCP VM..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'outputs' \
  . "${SSH_HOST}:${REMOTE_DIR}/"

# Step 2: Install dependencies on remote
echo ""
echo "Step 2: Installing dependencies on GCP VM..."
ssh "$SSH_HOST" "cd $REMOTE_DIR && npm install"

# Step 3: Copy systemd service file
echo ""
echo "Step 3: Setting up systemd service..."
ssh "$SSH_HOST" "sudo cp $REMOTE_DIR/scripts/worker.service /etc/systemd/system/${SERVICE_NAME}.service"
ssh "$SSH_HOST" "sudo systemctl daemon-reload"

# Step 4: Enable and start the service
echo ""
echo "Step 4: Enabling and starting worker service..."
ssh "$SSH_HOST" "sudo systemctl enable $SERVICE_NAME"
ssh "$SSH_HOST" "sudo systemctl restart $SERVICE_NAME"

# Step 5: Check status
echo ""
echo "Step 5: Checking service status..."
ssh "$SSH_HOST" "sudo systemctl status $SERVICE_NAME --no-pager" || true

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Useful commands:"
echo "  View logs:     ssh $SSH_HOST 'sudo journalctl -u $SERVICE_NAME -f'"
echo "  Restart:       ssh $SSH_HOST 'sudo systemctl restart $SERVICE_NAME'"
echo "  Stop:          ssh $SSH_HOST 'sudo systemctl stop $SERVICE_NAME'"
echo "  Status:        ssh $SSH_HOST 'sudo systemctl status $SERVICE_NAME'"
echo ""

sudo apt update
sudo apt install snapd curl git docker.io
sudo chmod 777 /var/run/docker.sock
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
sudo snap install kubectl --classic
sudo snap install helm --classic


FROM ubuntu

  # Replace shell with bash
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt-get update --fix-missing
RUN apt-get install -y curl openjdk-8-jdk build-essential libssl-dev apt-transport-https ca-certificates software-properties-common openssh-server
RUN sed -i 's|session    required     pam_loginuid.so|session    optional     pam_loginuid.so|g' /etc/pam.d/sshd
RUN mkdir -p /var/run/sshd

RUN adduser --quiet jenkins
RUN echo "jenkins:jenkins" | chpasswd

RUN apt-get install -y git

RUN curl https://download.docker.com/linux/static/stable/x86_64/docker-18.06.1-ce.tgz -o install.tgz && \
  tar xzvf install.tgz && \
  cp docker/* /usr/bin/

ENV NVM_DIR /home/jenkins/.nvm
RUN mkdir -p $NVM_DIR
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | sh
RUN chown -R jenkins $NVM_DIR
RUN echo "source /home/jenkins/.nvm/nvm.sh" >> /home/jenkins/.bashrc
RUN source /home/jenkins/.nvm/nvm.sh && nvm install 10 --lts && nvm alias default 10

RUN curl -L https://storage.googleapis.com/kubernetes-release/release/v1.11.3/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl
RUN chmod +x /usr/local/bin/kubectl

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]

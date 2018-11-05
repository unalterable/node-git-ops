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
ENV DOCKER_URL 172.17.0.1
RUN echo "alias docker=\"docker -H $DOCKER_URL\"" > /home/jenkins/.bashrc

ENV NVM_DIR /home/jenkins/.nvm
RUN mkdir -p $NVM_DIR
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | sh
RUN chown -R jenkins $NVM_DIR

RUN echo "source /home/jenkins/.nvm/nvm.sh" >> /home/jenkins/.bashrc
RUN echo "echo bashrc \$(date) >> ~/count" >> /home/jenkins/.bashrc

RUN echo "source /home/jenkins/.nvm/nvm.sh" >> /home/jenkins/.profile
RUN echo "echo profile \$(date) >> ~/count" >> /home/jenkins/.profile

RUN echo "source /home/jenkins/.nvm/nvm.sh" >>/root/.bashrc
RUN echo "echo root bashrc \$(date) >> ~/count" >>/root/.bashrc

RUN echo "source /home/jenkins/.nvm/nvm.sh" >> /root/.profile
RUN echo "echo root profile \$(date) >> ~/count" >> /root/.profile

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]

echo '
apiVersion: v1
kind: Namespace
metadata:
  name: {{{ namespace }}}
' > namespace.yml

echo '
apiVersion: v1
kind: Service
metadata:
  name: {{{ serviceName }}}
  namespace: {{{ namespace }}}
spec:
  type: NodePort
  selector:
    app: {{{ applicationName }}}
  ports:
  - port: {{{ containerPort }}}
{{ #nodePort }}
    nodePort: {{{ nodePort }}}
{{ /nodePort }}
' > service.yml

echo '
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{{ applicationName }}}-deployment
  namespace: {{{ namespace }}}
  labels:
    app: {{{ applicationName }}}
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: {{{ maxSurge }}}
      maxUnavailable: {{{ maxUnavailable }}}
  replicas: {{{ replicas }}}
  selector:
    matchLabels:
      app: {{{ applicationName }}}
  template:
    metadata:
      labels:
        app: {{{ applicationName }}}
        version: {{{ applicationVersion }}}
    spec:
      containers:
      - name: {{{ applicationName }}}
        image: {{{ imageName }}}:$dockerTag
        ports:
        - containerPort: {{{ containerPort }}}
' > deployment.yml

kubectl --kubeconfig="$ADMIN_CONF" apply -f namespace.yml
kubectl --kubeconfig="$ADMIN_CONF" apply -f deployment.yml
kubectl --kubeconfig="$ADMIN_CONF" apply -f service.yml

#!/bin/sh

deploy_secrets() {
	read -p "Applying secrets to k8s $environment environment for app $app and namespace $namespace. Continue? (Y/n): " -n 1 -r
	echo  #
  if [[ $REPLY =~ ^[Yy]$ ]]; then
		echo "Configuring secrets..."
    kubectl --server=https://$ip --insecure-skip-tls-verify=true --username=admin --password=$password delete secret -n $namespace $app-secrets || echo "Failed to delete secret. OK for first time deployment."
    kubectl --server=https://$ip --insecure-skip-tls-verify=true --username=admin --password=$password create secret generic -n $namespace $app-secrets  --from-env-file=secrets/.env.$environment

    # TODO remove the commented code below. This secrets should not be rotate every time secrets are deployed
    # kubectl delete secret -n $namespace cloudsql-db-credentials || echo "Failed to delete cloudsql-db-credentials. OK for first time deployment."
    # kubectl create secret -n $namespace generic cloudsql-db-credentials --from-literal=username=postgres --from-literal=password=39IF647MpNxtEuNw

    # kubectl delete secret -n $namespace cloudsql-instance-credentials || echo "Failed to delete cloudsql-instance-credentials. OK for first time deployment."
    # kubectl create secret -n $namespace generic cloudsql-instance-credentials --from-file=credentials.json=deployment/secrets/flatspad.json

	fi
}

app=maskani-api
ip=$2
password=$3
case $1 in
    dev)
        environment=development
        namespace=$environment
        deploy_secrets
        ;;
    sandbox)
        environment=sandbox
        namespace=$environment
        deploy_secrets
        ;;
    staging)
        environment=staging
        namespace=$environment
        deploy_secrets
        ;;
    prod)
        environment=production
        namespace=$environment
        deploy_secrets
        ;;
    *)
        echo "
usage: deploy [dev | sandbox | staging | prod ]  [ CLUSTER_IP ] [ PASSWORD (Add password with single quotes) ]
"
		;;
esac

.PHONY: build
SHELL := /bin/bash
export PATH := $(CURDIR)/_tools/bin:$(PATH)
EPOCH=$(shell date +"%s")

GitHubRepoName=ihelp
GitHubBranch=$(shell git rev-parse --abbrev-ref HEAD)
GitHubToken=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
GitHubRepoOwner=ihelp-dev

ACCOUNTNAME=covid
REGION=us-west-2
AppName=$(GitHubRepoName)
Environment=production
aws=aws --profile $(ACCOUNTNAME) --region $(REGION)
REPO_URI=776006903638.dkr.ecr.$(REGION).amazonaws.com
NODE_IMAGE=$(REPO_URI)/node
IMAGE_URI=$(REPO_URI)/$(AppName)-$(Environment)


create_pipeline_prod: validate_templates
	$(aws) cloudformation create-stack \
		--stack-name "main-frontend" \
		--parameters \
			ParameterKey=Environment,ParameterValue=$(Environment) \
			ParameterKey=AppName,ParameterValue=$(AppName) \
			ParameterKey=GitHubRepoName,ParameterValue=$(GitHubRepoName) \
			ParameterKey=GitHubBranch,ParameterValue=$(GitHubBranch) \
			ParameterKey=GitHubRepoOwner,ParameterValue=$(GitHubRepoOwner) \
			ParameterKey=GitHubToken,ParameterValue=$(GitHubToken) \
		--template-body file://configuration/cloudformation/pipeline/pipeline-prod.yaml \
		--capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND

delete_pipeline:
	#$(eval artificatsBucket=$(AppName)-$(Environment)-codepipeline-artifacts)
	#$(aws) s3 rm s3://$(artificatsBucket) --recursive

	$(aws) cloudformation delete-stack \
		--stack-name "main-frontend"

validate_templates:
	$(aws) cloudformation validate-template --template-body file://./configuration/cloudformation/pipeline/pipeline-prod.yaml 1>/dev/null
	$(aws) cloudformation validate-template --template-body file://./configuration/cloudformation/infra/ecs.yaml 1>/dev/null
	
update_pipeline: validate_templates
	$(aws) cloudformation update-stack \
		--stack-name main-frontend \
		--template-body file://configuration/cloudformation/pipeline/pipeline-prod.yaml \
		--parameters \
			ParameterKey=Environment,ParameterValue=$(Environment) \
			ParameterKey=AppName,ParameterValue=$(AppName) \
			ParameterKey=GitHubRepoName,ParameterValue=$(GitHubRepoName) \
			ParameterKey=GitHubBranch,ParameterValue=$(GitHubBranch) \
			ParameterKey=GitHubRepoOwner,ParameterValue=$(GitHubRepoOwner) \
			ParameterKey=GitHubToken,ParameterValue=$(GitHubToken) \
		--capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND

login_ecs:
	aws --region $(REGION) ecr get-login-password  | docker login --username AWS --password-stdin $(REPO_URI)
	$(aws ecr get-login --no-include-email $(REGION))

docker_local:
	docker build . -t ${AppName}:local --build-arg NODE_IMAGE=${NODE_IMAGE} 
	docker run -it -p 3001:3000 ${AppName}:local

setup_prod_infra: validate_templates  create_pipeline_prod 
	echo "Infra created"

delete_infra: delete_pipeline  
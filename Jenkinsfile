pipeline {
  agent {
    node {
      label 'base'
    }

  }

  environment {
        DOCKER_CREDENTIAL_ID = 'dockerhub'
        GITHUB_CREDENTIAL_ID = 'github-ssh'
        KUBECONFIG_CREDENTIAL_ID = 'kubeconfig'
        REGISTRY = 'dockerhub.qingcloud.com'
        DOCKERHUB_NAMESPACE = 'eachchat'
        APP_NAME = 'matrix-dimension'
        SONAR_CREDENTIAL_ID = 'sonar-token'
        SONAR_HOST_ID = 'sonar-host'
  }
  stages {
    stage('代码拉取') {
      steps {
        checkout([
          $class: 'GitSCM',
          branches: scm.branches,
          doGenerateSubmoduleConfigurations: false,
          extensions: [[$class: 'SubmoduleOption',
                        disableSubmodules: false,
                        parentCredentials: true,
                        recursiveSubmodules: true,
                        reference: '',
                        trackingSubmodules: false],
                      [$class: 'CleanBeforeCheckout'], 
                      [$class: 'CleanCheckout']],
          submoduleCfg: [],
          userRemoteConfigs: [[credentialsId: "$GITHUB_CREDENTIAL_ID",
                              url: "${env.GIT_URL}"]]
                              ]
          )
      }
    }

    stage('推送镜像') {
      steps {
        container('base') {
          withCredentials([usernamePassword(credentialsId : "$DOCKER_CREDENTIAL_ID" ,passwordVariable : 'DOCKER_PASSWORD' ,usernameVariable : 'DOCKER_USERNAME' ,)]) {
            sh 'echo "$DOCKER_PASSWORD" | docker login $REGISTRY -u "$DOCKER_USERNAME" --password-stdin'
            sh 'docker build -t $REGISTRY/$DOCKERHUB_NAMESPACE/$APP_NAME:$(git rev-parse --short HEAD) .'
            sh 'docker push $REGISTRY/$DOCKERHUB_NAMESPACE/$APP_NAME:$(git rev-parse --short HEAD)'
          }
        }
      }
    }

    //stage('显示新镜像') {
    //  steps {
    //    //echo "新tag: $BRANCH_NAME-$BUILD_NUMBER"
    //    sh 'echo "$(git rev-parse --short HEAD)"'
    //  }
    //}

    // stage('部署镜像') {
    //   steps {
    //     input(id: 'deploy-to-dev', message: "部署 $BRANCH_NAME-$BUILD_NUMBER 吗?")
    //     kubernetesDeploy(configs: 'deploy/develop/**', enableConfigSubstitution: true, kubeconfigId: "$KUBECONFIG_CREDENTIAL_ID")
    //   }
    // }
  }
}
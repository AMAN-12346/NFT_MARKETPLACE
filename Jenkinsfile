pipeline {
     agent {
         label 'mean2'
     }
     stages {
        stage("Build") {
            steps {
                sh "yarn"
               
            }
        }
        stage("Deploy") {
            steps {
                sh "sudo pm2 restart 12jyotirlinga-1966"
                
            }
        }
    }
}

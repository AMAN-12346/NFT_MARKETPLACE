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
                sh "sudo pm2 restart nftcreation-1965"
                sh "echo nftcreationmarketplace.mobiloitte.io"
                
            }
        }
    }
}

import sys
import subprocess


def build():
    print("Building...")
    subprocess.call(["sudo", "docker", "build", "--tag", "scrubbler", "."])
    print("Building complete")


def deploy():
    print("Deploying...")
    print("Tagging image...")
    subprocess.call(["sudo", "docker", "image", "tag", "scrubbler:latest", "cloud.canister.io:5000/thomassteinbinder/scrubbler:latest"])
    print("Pushing to dockerhub...")
    subprocess.call(["sudo", "docker", "image", "push", "cloud.canister.io:5000/thomassteinbinder/scrubbler"])
    print("Deploying complete")

def pull_and_run():
    print("Pulling...")
    print("Stop running containers...")
    subprocess.call('sudo docker stop $(sudo docker ps -f ancestor=cloud.canister.io:5000/thomassteinbinder/scrubbler -q)', shell=True)
    print("Remove all containers...")
    subprocess.call('sudo docker rm $(sudo docker ps -f ancestor=cloud.canister.io:5000/thomassteinbinder/scrubbler -q)', shell=True)
    print("Pulling latest image...")
    subprocess.call(["sudo", "docker", "pull", "cloud.canister.io:5000/thomassteinbinder/scrubbler"])
    print("Starting container...")
    subprocess.call(["sudo", "docker", "run", "--publish", "80:3000", "--env-file", "./.env", "-d", "cloud.canister.io:5000/thomassteinbinder/scrubbler"])
    print("Pulling complete!")
    print("Container running!")


def main(args):
    if not args:
        print("Usage: python3 DEPLOY.py <action>")
        exit()

    action = args[0]
    if action == "build":
        build()
    elif action == "deploy":
        deploy()
    elif action == "pull":
        pull_and_run()
    else:
        print("Wrong action!")
        print("Possible: build, deploy, pull")

if __name__ == "__main__":
    main(sys.argv[1:])

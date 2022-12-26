import sys
import subprocess


def build():
    subprocess.call(["sudo", "docker", "build", "--tag", "scrubbler", "."])


def deploy():
    subprocess.call(["sudo", "docker", "image", "tag", "scrubbler:latest", "cloud.canister.io:5000/thomassteinbinder/scrubbler:latest"])
    subprocess.call(["sudo", "docker", "image", "push", "cloud.canister.io:5000/thomassteinbinder/scrubbler"])

def pull_and_run():
    subprocess.call('sudo docker stop $(sudo docker ps -a -q)', shell=True)
    subprocess.call('sudo docker rm $(sudo docker ps -a -q)', shell=True)
    subprocess.call(["sudo", "docker", "pull", "cloud.canister.io:5000/thomassteinbinder/scrubbler"])
    subprocess.call(["sudo", "docker", "run", "--publish", "80:3000", "--env-file", "./.env", "-d", "cloud.canister.io:5000/thomassteinbinder/scrubbler"])


def main(args):
    if not args:
        print("no argument")
        exit()

    action = args[0]
    if action == "build":
        build()
    elif action == "deploy":
        deploy()
    elif action == "pull":
        pull_and_run()

if __name__ == "__main__":
    main(sys.argv[1:])

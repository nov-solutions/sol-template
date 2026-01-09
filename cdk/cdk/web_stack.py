from aws_cdk import Stack
from aws_cdk import aws_ec2 as ec2
from aws_cdk import aws_iam as iam
from constructs import Construct
from decouple import config

SITE_NAME = config("NEXT_PUBLIC_SITE_NAME")


class WebStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # default vpc
        vpc = ec2.Vpc.from_lookup(
            self,
            SITE_NAME + "-web-vpc",
            is_default=True,
        )

        # security group
        security_group = ec2.SecurityGroup(
            self,
            SITE_NAME + "-web-security-group",
            vpc=vpc,
            allow_all_outbound=True,
        )

        # add ingress rule for port 22
        security_group.add_ingress_rule(
            peer=ec2.Peer.any_ipv4(),
            connection=ec2.Port.tcp(22),
            description="Allow SSH access from the Internet",
        )

        # add ingress rule for port 80
        security_group.add_ingress_rule(
            peer=ec2.Peer.any_ipv4(),
            connection=ec2.Port.tcp(80),
            description="Allow HTTP access from the Internet",
        )

        # add ingress rule for port 443# TODO: github image publishing pipeline
        security_group.add_ingress_rule(
            peer=ec2.Peer.any_ipv4(),
            connection=ec2.Port.tcp(443),
            description="Allow HTTPS access from the Internet.",
        )

        user_data = ec2.UserData.for_linux()
        user_data.add_commands(
            "sudo apt-get update -y",
            "sudo apt-get install -y ca-certificates curl gnupg make",
            "sudo install -m 0755 -d /etc/apt/keyrings",
            "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg",
            "sudo chmod a+r /etc/apt/keyrings/docker.gpg",
            'echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] '
            'https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" '
            "| sudo tee /etc/apt/sources.list.d/docker.list > /dev/null",
            "sudo apt-get update -y",
            "sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
            "sudo groupadd -f docker",
            "sudo usermod -aG docker ubuntu",
        )

        instance = ec2.Instance(
            self,
            SITE_NAME + "-web",
            instance_type=ec2.InstanceType("t2.medium"),
            machine_image=ec2.MachineImage.generic_linux(
                {"us-west-2": "ami-0e4a0595b254f1a4f"}
            ),
            vpc=vpc,
            # vpc_subnets=public_subnet,
            role=iam.Role(
                self,
                SITE_NAME + "-web-ec2-role",
                assumed_by=iam.ServicePrincipal("ec2.amazonaws.com"),
            ),
            security_group=security_group,
            instance_name=SITE_NAME + "-web",
            key_name=SITE_NAME + "-web",
            block_devices=[
                ec2.BlockDevice(
                    device_name="/dev/sda1",
                    volume=ec2.BlockDeviceVolume.ebs(
                        volume_size=50,  # Set volume size to 50 GiB
                        delete_on_termination=True,
                    ),
                )
            ],
        )

        elastic_ip = ec2.CfnEIP(self, SITE_NAME + "-web-eip")

        # associate the elastic ip with the ec2 instance
        ec2.CfnEIPAssociation(
            self,
            SITE_NAME + "-web-eip-association",
            eip=elastic_ip.ref,
            instance_id=instance.instance_id,
        )

        # Create development instance
        # ec2.Instance(
        #     self,
        #     SITE_NAME + "-web-dev",
        #     instance_type=ec2.InstanceType("t2.medium"),
        #     machine_image=ec2.MachineImage.generic_linux(
        #         {"us-west-2": "ami-0e4a0595b254f1a4f"}
        #     ),
        #     vpc=vpc,
        #     role=iam.Role(
        #         self,
        #         SITE_NAME + "-dev-ec2-role",
        #         assumed_by=iam.ServicePrincipal("ec2.amazonaws.com"),
        #     ),
        #     security_group=security_group,
        #     instance_name=SITE_NAME + "-web-dev",
        #     key_name=SITE_NAME + "-web-dev",
        #     block_devices=[
        #         ec2.BlockDevice(
        #             device_name="/dev/sda1",
        #             volume=ec2.BlockDeviceVolume.ebs(
        #                 volume_size=50,
        #                 delete_on_termination=True,
        #             ),
        #         )
        #     ],
        #     user_data=user_data,
        # )

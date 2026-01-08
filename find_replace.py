import os


def find_replace():
    """
    Replaces instances of "sol-web" with the value of SITE_NAME in ".env"
    """

    with open(".env", "r") as f:
        file = f.readlines()
    for line in file:
        key = line.split("=")[0]
        print(key)
        if key == "NEXT_PUBLIC_SITE_NAME":
            replace = line.split("=")[1].strip()
            break
    if not replace:
        raise ValueError("NEXT_PUBLIC_SITE_NAME not found in .env file")
    print("Replacing instances of sol-web with " + replace)

    for root, dirs, files in os.walk("."):
        for file in files:
            exclude_patterns = (
                "find_replace.py",
                ".git/",
                ".pyc",
                ".eot",
                ".ttf",
                ".woff",
                ".png",
                ".jpg",
                ".jpeg",
                ".ico",
                ".gif",
                "node_modules/",
                ".next/",
                ".DS_Store",
                ".env",
                ".webp",
                ".tgz",
            )

            if any(pattern in os.path.join(root, file) for pattern in exclude_patterns):
                continue
            print("file: " + file)
            with open(os.path.join(root, file), "r") as f:
                text = f.read()
            with open(os.path.join(root, file), "w") as f:
                f.write(text.replace("sol-web", replace + "-web"))


if __name__ == "__main__":
    find_replace()

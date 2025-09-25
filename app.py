from flask import Flask

# Create an instance of the Flask class
app = Flask(__name__)

# Define a "route" for the homepage
@app.route('/')
def home():
    # This is what the user will see when they go to your domain
    return "Hello! Welcome to my website."

# This part is not strictly necessary for Render, but it's good practice
# for running the app locally.
if __name__ == '__main__':
    app.run(debug=True)
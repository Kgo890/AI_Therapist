AI Therapist App 

A full-stack AI-powered mental health chatbot that lets users interact with a therapist-like assistant through text or speech. The app uses Natural Language Processing (NLP) models for emotion classification and empathetic response generation, built with Hugging Face Transformers and FastAPI.

- Features 
  - Text and speech input support via Web Speech API
  - Real-time emotion detection using a RoBERTa-based model
  - GPT-2-based text generation for empathetic therapist responses
  - Auth system: register, login, logout, password reset
  - Stores last 3 conversations per user to maintain context
  - REST API backend with token-based authentication (JWT)
  - Responsive React dashboard to chat with your AI therapist
  - MongoDB database to store users and conversation history

- Tech Stack
  - Frontend
    - React
    - Axios
    - Material UI 
    - React Router
    - Web Speech APi
    
  - Backend 
    - FastAPI
    - MongoDB(pyMongo)
    - Huggingface Transformer 
      - Therapist response NLP model using distilgpt2 
      - bhadresh-savani/roerta-base-emotion for emotion classification
      
  - Deployment 
    - Frontend
      - Vercel 
    - Backend
      - Render
    - Database
      - MongoDB Atlas

- How it works: 
  - Frontend 
    - First, I created a login and register page using React. These forms collect user information (email, username, and password) and send it to the backend using Axios. Once the user logs in, the access and refresh tokens are stored in the browser cookies for secure, persistent sessions.
    - After authentication, the user is redirected to the dashboard page, which is the main interface for chatting with the AI therapist.
    - In the dashboard, the user can type their message into a text box or use the Web Speech API to convert their voice into text. Once the user clicks submit, the response is sent via Axios to the backend generate response endpoint.
    - The backend detects the user’s emotion using the RoBERTa model, saves the conversation pair (user + therapist), and generates a response using the fine-tuned GPT-2 model. That response is returned to the frontend.
    - Once the frontend receives the response, it updates the state and displays both the user response and therapist reply in the chat thread. I used useState to manage the chat flow and useEffect for auto-refresh behaviors.
    - I made another Axios call to get the recent 3-message conversation history from MongoDB. This is fetched on component mount so the chat always continues where the user left off.
    - All Axios requests go through a centralized Axios instance file where I configured withCredentials: true and auto-refreshing of expired access tokens using the refresh route.
    - I also created a reset password page that lets users request a password update by submitting their email and new password. This sends a PUT request to the reset password backend route.
    - I styled the entire UI with Material UI components and made the layout responsive for mobile and desktop views.
    - Navigation is handled through React Router, and I included conditional logic to restrict access to protected pages unless the user is logged in.


  - Backend 
      - First we trained to model, one for emotion classification in text and one for generating therapeutic responses.
      - For the emotion classification, I first loaded the dataset, dair-ai/emotion dataset found in HuggingFace, then we loaded the model and the tokenizer. After we loaded everything we tokenized the dataset as this dataset contains sentences and their associated emotion and with that transformers expect numerical inputs rather text. I did a 90/10 split train split because the dataset is not massive and I need the model to learn as much as possible, then formated the now split data for PyTorch. Using Trainer and TrainerArguments, I fine-tuned the model with 5 epochs, 32 batch size and the metric I use was accuracy because the dataset ws unbalance I could not use precision or recall, so I just want the best overall performance. The Results that I got back is a 93% accuracy which is excellent. Then saved the model 
      - For the generative therapeutic response, I basically did the same thing but instead of using a pretrained model I used distilgpt2, then I trained the model on two kaggle datasets https://www.kaggle.com/datasets/nguyenletruongthien/mental-health?select=conversations_training.csv and https://www.kaggle.com/datasets/thedevastator/nlp-mental-health-conversations, each having the user response and therapist response. then trained the model twice like in the emotion classification, but I'm using loss as my metric as there is a huge amount of outcomes so cant use accuracy and also since I'm using cross entropy loss it compares  the predicted probability distribution over the words each step. So the lower the loss the higher the probability of the next token to be correct. The results I got for the first trained model was a loss of 1.8 with 5 epochs and for the second trained model I got 1.6 with 20 epoches not good and not bad 
      - After saving the model I load the model into a and made 3 functions, one for predicting emotions, one for getting conversation history as the history is going to be used to help generate a response for the therapist and one for generating the actual responses 
      - Made another py file for all the functions for authentication like logining in, registering, login out, refreshing tokens and resetting the password
      - Those two files get connected to the FastApi via routes and then that get sent to the frontend via axios
      - made a mongo file to save the users information in a database 
    
- Live Demo: https://ai-therapist-fezkuw7qz-kaden-gores-projects.vercel.app
- Motivation 
  - My motivation for this project was to make something that was both challenging and meaningful. I wanted to push my limits in NLP while also building a project that could provide comfort and support to people, especially those dealing with stress, anxiety, or isolation.

- Troubles 
  - For the conversation NLP model, I trained the model on HuggingFace's distilgpt2 and I used two datasets that I found on Kaggle that had User responses and Therapeutic like responses. The problem was that I was not enough to get really accurate response like something you would see in chatgpt because when you get the response it would be gibberish and other times it would be a good response. So next time I will use a pretrained model like I did with the Transformer based emotion classification model

- Future Enhancements:
  - Use a pretrained model for generating responses or use OpenAI LLM API 
  - Make a more modernized version of the UI 
  - Balance the Emotion dataset for better accuracy as some labels have fewer data
  - add a therapist avatar that can use text to speech to talk back to you 
  - show daily login and what you talked about that day 
  - show what the emotion were for each day 
  - add bar graphs and more data for the user 

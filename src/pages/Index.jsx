import React, { useEffect, useState } from "react";
import { Container, Text, VStack, Button, List, ListItem, Spinner } from "@chakra-ui/react";
import { FaGoogle } from "react-icons/fa";

const CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
const API_KEY = "YOUR_API_KEY";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

const Index = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClientLoad = () => {
      window.gapi.load("client:auth2", initClient);
    };

    const initClient = () => {
      window.gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(() => {
          const authInstance = window.gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());
          authInstance.isSignedIn.listen(setIsSignedIn);
        });
    };

    handleClientLoad();
  }, []);

  const handleSignInClick = () => {
    window.gapi.auth2.getAuthInstance().signIn();
  };

  const handleSignOutClick = () => {
    window.gapi.auth2.getAuthInstance().signOut();
  };

  const listMessages = () => {
    setLoading(true);
    window.gapi.client.gmail.users.messages
      .list({
        userId: "me",
        maxResults: 10,
      })
      .then((response) => {
        const messages = response.result.messages;
        const messagePromises = messages.map((message) =>
          window.gapi.client.gmail.users.messages.get({
            userId: "me",
            id: message.id,
          }),
        );
        Promise.all(messagePromises).then((results) => {
          setMessages(results.map((result) => result.result));
          setLoading(false);
        });
      });
  };

  return (
    <Container centerContent maxW="container.md" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <VStack spacing={4}>
        <Text fontSize="2xl">Gmail API Example</Text>
        {isSignedIn ? (
          <>
            <Button leftIcon={<FaGoogle />} colorScheme="red" onClick={handleSignOutClick}>
              Sign Out
            </Button>
            <Button colorScheme="blue" onClick={listMessages}>
              List Messages
            </Button>
            {loading ? (
              <Spinner />
            ) : (
              <List spacing={3}>
                {messages.map((message) => (
                  <ListItem key={message.id}>{message.snippet}</ListItem>
                ))}
              </List>
            )}
          </>
        ) : (
          <Button leftIcon={<FaGoogle />} colorScheme="red" onClick={handleSignInClick}>
            Sign In with Google
          </Button>
        )}
      </VStack>
    </Container>
  );
};

export default Index;

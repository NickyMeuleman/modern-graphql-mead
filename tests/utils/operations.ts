import { gql } from "apollo-boost";

const createUser = gql`
  mutation($data: CreateUserInput!) {
    createUser(data: $data) {
      token
      user {
        id
      }
    }
  }
`;

const getUsers = gql`
  query {
    users {
      id
      name
      email
    }
  }
`;

const loginMutation = gql`
  mutation($data: LoginInput!) {
    login(data: $data) {
      token
    }
  }
`;

const getProfile = gql`
  query {
    me {
      id
      name
      email
    }
  }
`;

const getPosts = gql`
  query($onlyOwn: Boolean) {
    posts(onlyOwn: $onlyOwn) {
      id
      title
      body
      published
    }
  }
`;

const updatePost = gql`
  mutation($id: ID!, $data: UpdatePostInput!) {
    updatePost(id: $id, data: $data) {
      id
      title
      body
      published
    }
  }
`;

const createPost = gql`
  mutation($data: CreatePostInput!) {
    createPost(data: $data) {
      id
      title
      body
      published
    }
  }
`;

const deletePost = gql`
  mutation($id: ID!) {
    deletePost(id: $id) {
      id
    }
  }
`;

const deleteComment= gql`mutation($id:ID!) {
  deleteComment(id:$id) {
    id
  }
}`

export {
  createUser,
  getUsers,
  loginMutation,
  getProfile,
  getPosts,
  updatePost,
  createPost,
  deletePost,
  deleteComment
};

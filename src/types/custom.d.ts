export interface IUser {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type IUserCreate = Omit<IUser, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'> & {
    password: string; // Use plain text password which will be hashed
  };
  
  // When updating a user, make all fields optional
  export type IUserUpdate = Partial<Omit<IUser, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'>> & {
    password?: string; // Optionally allow password update, should be hashed before saving
  };
  
  // Post-related types
  export interface IPost {
    id: string;
    title: string;
    content: string;
    userId: string;
    createdAt: Date;
    updatedAt?: Date;
  }
  
  export type IPostCreate = Pick<IPost, 'title' | 'content' | 'userId'>;
  export type IPostUpdate = Pick<IPost, 'title' | 'content'>;
  export type IPostResponse = Omit<IPost, 'userId'> & {
    authorName?: string;
    commentCount?: string;
  };
  
  // Comment-related types
  export interface IComment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }
  

  // custom.d.ts

export interface IUserResponse {
    id: string;
    name: string;
    email: string;
    passwordHash: string; 
    createdAt: Date;
    updatedAt: Date;
}


export interface IComment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Comment Create type
  export type ICommentCreate = Pick<IComment, 'postId' | 'userId' | 'content'>;
  
  // Comment Update type
  export type ICommentUpdate = Pick<IComment, 'content'>;
  
  // Comment Response type
  export type ICommentResponse = Omit<IComment, 'userId' | 'postId'> & {
    authorName?: string;
    postTitle?: string;
  };
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { message } = await request.json()

  // Mock response data with Markdown content
  const mockResponse = {
    message: `
# Response to User Query

Here's a response to your query about the user authentication system:

## Key Components

1. **User Model**: Defines the structure of user data
2. **Authentication Service**: Handles login, logout, and session management
3. **Login Component**: User interface for authentication

## Code Snippets

### User Model (TypeScript)

\`\`\`typescript
interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Hashed, never store plain text!
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  roles: string[];
}

// User creation type
type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'lastLogin'>;
\`\`\`

### Authentication Function (TypeScript)

\`\`\`typescript
async function authenticateUser(
  username: string, 
  password: string
): Promise<AuthResult> {
  try {
    // Find user by username
    const user = await db.users.findUnique({ 
      where: { username } 
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password hash
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      throw new Error('Invalid password');
    }

    // Generate JWT token
    const token = await generateToken(user);

    return {
      success: true,
      user,
      token,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
\`\`\`

For more information, check the related files in the sidebar.
    `,
    relatedProjects: [
      {
        id: 1,
        name: "User Management System",
        relatedFiles: [
          {
            name: "UserModel.ts",
            path: "/src/models/UserModel.ts",
            absolutePath: "C:\\Projects\\UserManagementSystem\\src\\models\\UserModel.ts",
          },
          {
            name: "LoginComponent.tsx",
            path: "/src/components/LoginComponent.tsx",
            absolutePath: "C:\\Projects\\UserManagementSystem\\src\\components\\LoginComponent.tsx",
          },
        ],
      },
      {
        id: 2,
        name: "Authentication Service",
        relatedFiles: [
          {
            name: "auth.ts",
            path: "/src/utils/auth.ts",
            absolutePath: "C:\\Projects\\AuthenticationService\\src\\utils\\auth.ts",
          },
        ],
      },
    ],
  }

  // Simulate a delay to mimic processing time
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return NextResponse.json(mockResponse)
}


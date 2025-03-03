// src/app/profile/[id]/page.js
export default function Profile({ params }) {
    return (
      <div>
        <h1>User Profile</h1>
        <p>User ID: {params.id}</p>
      </div>
    );
  }
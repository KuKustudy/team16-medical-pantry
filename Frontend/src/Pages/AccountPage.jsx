import { Header } from "../Components/Header";
import { useState, useEffect } from "react";
import { useUser } from '@clerk/clerk-react'


export default function AccountPage(){
    const [isAdmin, setIsAdmin] = useState(false);
    const { isLoaded, isSignedIn, user } = useUser();
    
    useEffect(()=>{
        if(isLoaded && isSignedIn) {
            console.log(user);
            console.log("hello", user.firstName);
            console.log("user email:", user.primaryEmailAddress.emailAddress);
            console.log("user role:", user.publicMetadata.role);
            const pattern = /^[A-Za-z0-9._%+-]+@medicalpantry\.org$/i;
            if (pattern.test("julie@medicalpantry.org")) {
                console.log("user role is an admin");
                setIsAdmin(true);
            } else {
                console.log("user role is not an admin");
                setIsAdmin(false);
            }
        }
    }, [isLoaded, isSignedIn, user]);
    
    // Don’t render until user is loaded
    if (!isLoaded) {
        return <p>Loading...</p>;
    }

    // If not signed in, show sign-in prompt
    if (!isSignedIn) {
        return (
        <div>
            <Header />
            <h2>Please sign in to access this page.</h2>
        </div>
        );
    }

    // Admin check
    return isAdmin ? (
        <h2> placeholder for Admin content</h2>
    ) : (
        <div>
        <Header />
        <h2>Access restricted — admin users only.</h2>
        </div>
    );
}

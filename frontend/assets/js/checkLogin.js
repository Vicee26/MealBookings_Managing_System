const token = localStorage.getItem("token");
if (token == null) {
    window.location.href = 'login.html';
}
window.onload = async function() {
    const response = await fetch("http://localhost:3001/api/validations/token", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (! response.ok) {
        //throw new Error("There was an error authenticating.");
        window.location.href = 'login.html';
    }
    
};

const token2 = localStorage.getItem("token");
if (token2 == null) {
    window.location.href = 'login.html';
}

window.onload = async function () {
    console.log("ola")
    const response = await fetch("http://localhost:3001/api/validations/admin", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token2}`,
        },
    });

    console.log(response);

    if (!response.ok) {
        //throw new Error("There was an error authenticating.");
        window.location.href = 'login.html';
    }
};


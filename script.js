// ===============================
// CAMPUSFIX - MAIN SCRIPT
// ===============================


// ---------- GET COMPLAINTS ----------
function getComplaints() {

    let complaints = localStorage.getItem("campusFixComplaints");

    if (complaints) {

        try {
            return JSON.parse(complaints);
        } catch (error) {
            console.log("Complaint data error:", error);
            return [];
        }

    }

    // Old single complaint migration
    let oldComplaint = localStorage.getItem("campusFixComplaint");

    if (oldComplaint) {

        try {

            let oldData = JSON.parse(oldComplaint);

            let complaintsArray = [oldData];

            localStorage.setItem(
                "campusFixComplaints",
                JSON.stringify(complaintsArray)
            );

            return complaintsArray;

        } catch (error) {

            console.log("Old complaint data error:", error);

        }
    }

    return [];
}


// ---------- SAVE COMPLAINTS ----------
function saveComplaints(complaints) {

    localStorage.setItem(
        "campusFixComplaints",
        JSON.stringify(complaints)
    );
}


// ---------- SAFE TEXT ----------
function safeText(text) {

    if (text === null || text === undefined) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// STUDENT LOGIN
// ===============================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(e) {

        e.preventDefault();

        const studentId =
            document.getElementById("studentId").value.trim();

        if (!studentId) {

            alert("Please enter Student ID");

            return;
        }

        localStorage.setItem(
            "studentId",
            studentId
        );

        alert("Login Successful");

        window.location.href =
            "dashboard.html";
    });
}


// ===============================
// REPORT COMPLAINT
// ===============================

const problemForm =
    document.getElementById("problemForm");

if (problemForm) {

    problemForm.addEventListener("submit", function(e) {

        e.preventDefault();

        const photoInput =
            document.getElementById("photo");

        const photoFile =
            photoInput ? photoInput.files[0] : null;


        // ---------- PHOTO VALIDATION ----------

        if (
            photoFile &&
            !photoFile.type.startsWith("image/")
        ) {

            alert("Please select a valid image.");

            return;
        }


        if (
            photoFile &&
            photoFile.size > 1024 * 1024
        ) {

            alert(
                "Please upload an image under 1 MB."
            );

            return;
        }


        // ---------- SAVE COMPLAINT ----------

        function saveComplaint(photoData = "") {

            const complaints =
                getComplaints();


            const complaint = {

                id: Date.now(),

                studentId:
                    localStorage.getItem("studentId")
                    || "Student",

                category:
                    document.getElementById("category").value,

                title:
                    document.getElementById("problemTitle").value,

                description:
                    document.getElementById("description").value,

                location:
                    document.getElementById("location").value,

                photo:
                    photoData,

                status:
                    "Submitted",

                date:
                    new Date().toLocaleDateString()
            };


            // ADD NEW COMPLAINT
            complaints.push(complaint);


            // SAVE ALL COMPLAINTS
            saveComplaints(complaints);


            const message =
                document.getElementById(
                    "complaintMessage"
                );


            if (message) {

                message.textContent =
                    "Complaint submitted successfully!";

            }


            problemForm.reset();
        }


        // ---------- PHOTO EXISTS ----------

        if (photoFile) {

            const reader =
                new FileReader();


            reader.onload =
                function() {

                    saveComplaint(
                        reader.result
                    );

                };


            reader.onerror =
                function() {

                    alert(
                        "Photo could not be read. Please try again."
                    );

                };


            reader.readAsDataURL(
                photoFile
            );

        }

        // ---------- NO PHOTO ----------

        else {

            saveComplaint();

        }

    });
}


// ===============================
// SHOW SECTION
// ===============================

function showSection(
    heading,
    content
) {

    const section =
        document.getElementById(
            "complaintsSection"
        );

    const headingElement =
        document.getElementById(
            "detailsHeading"
        );

    const list =
        document.getElementById(
            "complaintsList"
        );


    if (
        !section ||
        !headingElement ||
        !list
    ) {

        return;
    }


    headingElement.innerHTML =
        heading;

    list.innerHTML =
        content;

    section.style.display =
        "block";


    section.scrollIntoView({
        behavior: "smooth"
    });
}


// ===============================
// MY COMPLAINTS
// ===============================
function myComplaints() {
    const studentId = localStorage.getItem("studentId");

    if (!studentId) {
        window.location.href = "index.html";
        return;
    }

    const complaints = getComplaints();

    const myData = complaints.filter(
        c => String(c.studentId) === String(studentId)
    );

    let content = "";

    if (myData.length === 0) {

        content = `
            <div class="no-complaints">
                <h3>📭 No Complaints Yet</h3>
                <p>You have not submitted any complaint.</p>
            </div>
        `;

    } else {

        myData.forEach(c => {

            let statusClass = "status-submitted";

            if (c.status === "In Progress") {
                statusClass = "status-progress";
            }

            if (c.status === "Resolved") {
                statusClass = "status-resolved";
            }

            content += `
                <div class="complaint-card">

                    <h3>📝 ${safeText(c.title)}</h3>

                    <div class="complaint-info">
                        📂 <strong>Category:</strong>
                        ${safeText(c.category)}
                    </div>

                    <div class="complaint-info">
                        📍 <strong>Location:</strong>
                        ${safeText(c.location)}
                    </div>

                    <div class="complaint-description">
                        <strong>📄 Description:</strong><br>
                        ${safeText(c.description)}
                    </div>

                    <div>
                        <strong>📌 Status:</strong>
                        <span class="status-badge ${statusClass}">
                            ${safeText(c.status)}
                        </span>
                    </div>

                    ${
                        c.photo
                        ? `
                            <img
                                src="${c.photo}"
                                class="complaint-photo"
                                alt="Complaint Photo"
                            >
                        `
                        : ""
                    }

                    <div class="complaint-date">
                        📅 ${safeText(c.date)}
                    </div>

                </div>
            `;
        });
    }

    showSection("📋 My Complaints", content);
}


// ===============================
// COMPLAINT STATUS
// ===============================

function complaintStatus() {

    const studentId =
        localStorage.getItem(
            "studentId"
        );


    const complaints =
        getComplaints().filter(
            function(c) {

                return String(c.studentId) ===
                       String(studentId);

            }
        );


    if (complaints.length === 0) {

        showSection(
            "📊 Complaint Status",
            "<p>No complaints found.</p>"
        );

        return;
    }


    let html = "";


    complaints.forEach(
        function(c) {

            let statusClass =
                "status-submitted";


            if (
                c.status === "In Progress"
            ) {

                statusClass =
                    "status-progress";

            }


            if (
                c.status === "Resolved"
            ) {

                statusClass =
                    "status-resolved";

            }


            html += `

            <div class="complaint-card">

                <h3>
                    ${safeText(c.title)}
                </h3>

                <p>
                    <strong>Complaint ID:</strong>
                    ${safeText(c.id)}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${safeText(c.category)}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${safeText(c.location)}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${safeText(c.date)}
                </p>

                <p>
                    <strong>Status:</strong>

                    <span class="status-badge ${statusClass}">
                        ${safeText(c.status)}
                    </span>

                </p>


                ${
                    c.photo
                    ? `
                    <div style="margin-top:12px;">

                        <strong>
                            Complaint Photo:
                        </strong>

                        <br>

                        <img
                            src="${c.photo}"
                            alt="Complaint Photo"
                            style="
                                width:100%;
                                max-width:300px;
                                height:auto;
                                border-radius:10px;
                                margin-top:8px;
                            "
                        >

                    </div>
                    `
                    : ""
                }

            </div>

            `;
        }
    );


    showSection(
        "📊 Complaint Status",
        html
    );
}


// ===============================
// PROFILE
// ===============================

function myProfile() {

    const studentId =
        localStorage.getItem(
            "studentId"
        ) || "Not Available";


    const complaints =
        getComplaints().filter(
            function(c) {

                return String(c.studentId) ===
                       String(studentId);

            }
        );


    showSection(

        "👤 My Profile",

        `

        <div class="complaint-card">

            <h3>
                Student Profile
            </h3>

            <p>
                <strong>Student ID:</strong>
                ${safeText(studentId)}
            </p>

            <p>
                <strong>Total Complaints:</strong>
                ${complaints.length}
            </p>

        </div>

        `
    );
}


// ===============================
// STUDENT DASHBOARD STATS
// ===============================

function updateDashboardStats() {

    const totalElement =
        document.getElementById(
            "totalComplaints"
        );

    const pendingElement =
        document.getElementById(
            "inProgress"
        );

    const resolvedElement =
        document.getElementById(
            "resolved"
        );


    if (!totalElement) {
        return;
    }


    const studentId =
        localStorage.getItem(
            "studentId"
        );


    const complaints =
        getComplaints().filter(
            function(c) {

                return String(c.studentId) ===
                       String(studentId);

            }
        );


    const pending =
        complaints.filter(
            function(c) {

                return (
                    c.status === "Submitted" ||
                    c.status === "In Progress"
                );

            }
        );


    const resolved =
        complaints.filter(
            function(c) {

                return c.status === "Resolved";

            }
        );


    totalElement.innerText =
        complaints.length;


    if (pendingElement) {

        pendingElement.innerText =
            pending.length;

    }


    if (resolvedElement) {

        resolvedElement.innerText =
            resolved.length;

    }
}


// ===============================
// DISPLAY ADMIN COMPLAINTS
// ===============================
function displayAdminComplaints(complaints) {

    const list = document.getElementById("adminComplaintsList");

    if (!list) return;

    if (complaints.length === 0) {

        list.innerHTML = `
            <div class="no-complaints">
                <h3>📭 No Complaints Found</h3>
                <p>No complaint matches your search/filter.</p>
            </div>
        `;

        return;
    }

    let html = "";

    complaints.forEach(c => {

        let statusClass = "status-submitted";

        if (c.status === "In Progress") {
            statusClass = "status-progress";
        }

        if (c.status === "Resolved") {
            statusClass = "status-resolved";
        }

        html += `
            <div class="admin-complaint-card">

                <h3>📝 ${safeText(c.title)}</h3>

                <div class="admin-info">
                    👤 <strong>Student ID:</strong>
                    ${safeText(c.studentId)}
                </div>

                <div class="admin-info">
                    📂 <strong>Category:</strong>
                    ${safeText(c.category)}
                </div>

                <div class="admin-info">
                    📍 <strong>Location:</strong>
                    ${safeText(c.location)}
                </div>

                <div class="admin-description">
                    <strong>📄 Description:</strong><br>
                    ${safeText(c.description)}
                </div>

                <div>
                    <strong>📌 Current Status:</strong>

                    <span class="status-badge ${statusClass}">
                        ${safeText(c.status)}
                    </span>
                </div>

                ${
                    c.photo
                    ? `
                        <img
                            src="${c.photo}"
                            class="admin-photo"
                            alt="Complaint Photo"
                        >
                    `
                    : ""
                }

                <div class="admin-date">
                    📅 ${safeText(c.date)}
                </div>

                <div class="admin-status-box">

                    <label>
                        🔄 Change Status
                    </label>

                    <select
                        onchange="changeComplaintStatus('${c.id}', this.value)"
                    >

                        <option value="Submitted"
                            ${c.status === "Submitted" ? "selected" : ""}>
                            Submitted
                        </option>

                        <option value="In Progress"
                            ${c.status === "In Progress" ? "selected" : ""}>
                            In Progress
                        </option>

                        <option value="Resolved"
                            ${c.status === "Resolved" ? "selected" : ""}>
                            Resolved
                        </option>

                    </select>

                </div>

            </div>
        `;
    });

    list.innerHTML = html;
}

// ===============================
// ADMIN DASHBOARD
// ===============================

function loadAdminDashboard() {

    const complaints = getComplaints();

    const total = complaints.length;

    const pending = complaints.filter(
        c => c.status === "Submitted" ||
             c.status === "In Progress"
    ).length;

    const resolved = complaints.filter(
        c => c.status === "Resolved"
    ).length;

    const totalElement = document.getElementById("adminTotal");
    const pendingElement = document.getElementById("adminPending");
    const resolvedElement = document.getElementById("adminResolved");

    if (totalElement) {
        totalElement.textContent = total;
    }

    if (pendingElement) {
        pendingElement.textContent = pending;
    }

    if (resolvedElement) {
        resolvedElement.textContent = resolved;
    }

    displayAdminComplaints(complaints);
}
// ===============================
// ADMIN SEARCH + FILTER
// ===============================

function filterAdminComplaints() {

    const searchInput =
        document.getElementById(
            "searchComplaint"
        );


    const statusInput =
        document.getElementById(
            "statusFilter"
        );


    if (
        !searchInput ||
        !statusInput
    ) {

        return;
    }


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedStatus =
        statusInput.value;


    const complaints =
        getComplaints();


    const filtered =
        complaints.filter(
            function(c) {

                const matchesSearch =

                    String(c.id)
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(c.studentId || "")
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(c.title || "")
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(c.category || "")
                        .toLowerCase()
                        .includes(search);


                const matchesStatus =

                    selectedStatus === "All"

                    ||

                    c.status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    displayAdminComplaints(
        filtered
    );
}


// ===============================
// CHANGE COMPLAINT STATUS
// ===============================

function changeComplaintStatus(
    id,
    newStatus
) {

    let complaints =
        getComplaints();


    const complaint =
        complaints.find(
            function(c) {

                return String(c.id) ===
                       String(id);

            }
        );


    if (!complaint) {

        alert(
            "Complaint not found!"
        );

        return;
    }


    complaint.status =
        newStatus;


    saveComplaints(
        complaints
    );


    alert(
        "Complaint status updated to "
        + newStatus
    );


    loadAdminDashboard();

    updateDashboardStats();
}


// ===============================
// ADMIN LOGIN
// ===============================

const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );


if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        function(e) {

            e.preventDefault();


            const adminId =
                document.getElementById(
                    "adminId"
                ).value.trim();


            const adminPassword =
                document.getElementById(
                    "adminPassword"
                ).value.trim();


            if (
                adminId === "admin" &&
                adminPassword === "1234"
            ) {

                localStorage.setItem(
                    "adminLoggedIn",
                    "true"
                );


                alert(
                    "Admin Login Successful"
                );


                window.location.href =
                    "admin.html";

            }

            else {

                alert(
                    "❌ Invalid Admin ID or Password"
                );

            }

        }
    );
}


// ===============================
// ADMIN LOGOUT
// ===============================

function adminLogout() {

    localStorage.removeItem(
        "adminLoggedIn"
    );


    window.location.href =
        "admin-login.html";
}


// ===============================
// STUDENT LOGOUT
// ===============================

function logout() {

    localStorage.removeItem(
        "studentId"
    );


    window.location.href =
        "index.html";
}


// ===============================
// PROTECT ADMIN DASHBOARD
// ===============================

if (

    window.location.pathname.includes(
        "admin.html"
    )

    &&

    localStorage.getItem(
        "adminLoggedIn"
    ) !== "true"

) {

    window.location.href =
        "admin-login.html";
}


// ===============================
// PAGE LOAD
// ===============================

updateDashboardStats();

loadAdminDashboard();
const nodemailer = require("nodemailer");

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}

function welcomeEmailHtml({ firstName, lastName }) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const fullName = `${firstName} ${lastName}`.trim();

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to CampusConnect</title>
        <style>
          @media only screen and (max-width:600px) {
            .email-shell {
              padding:20px 10px !important;
            }
            .email-card {
              border-radius:16px !important;
            }
            .email-header,
            .email-content,
            .email-footer {
              padding-left:20px !important;
              padding-right:20px !important;
            }
            .email-header {
              padding-top:20px !important;
              padding-bottom:20px !important;
            }
            .header-brand,
            .header-badge {
              display:block !important;
              width:auto !important;
              text-align:left !important;
            }
            .header-badge {
              padding-top:14px !important;
            }
            .email-hero {
              padding:32px 22px !important;
            }
            .welcome-title {
              font-size:29px !important;
              line-height:1.2 !important;
              letter-spacing:-0.4px !important;
              overflow-wrap:anywhere;
            }
            .email-content {
              padding-top:28px !important;
              padding-bottom:28px !important;
            }
            .feature-card {
              padding:14px !important;
            }
            .feature-icon {
              width:36px !important;
              height:36px !important;
              font-size:17px !important;
            }
            .feature-copy {
              padding-left:10px !important;
            }
            .welcome-cta {
              display:block !important;
              box-sizing:border-box !important;
              width:100% !important;
              padding:14px 12px !important;
            }
            .quick-start {
              padding:16px !important;
            }
            .email-footer {
              padding-top:22px !important;
              padding-bottom:22px !important;
            }
          }
        </style>
      </head>

      <body
        style="
          margin:0;
          padding:0;
          background:#f1f5f9;
          font-family:Arial, Helvetica, sans-serif;
          color:#0f172a;
        "
      >

        <!-- Main Wrapper -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="background:#f1f5f9;"
        >
          <tr>
            <td class="email-shell" align="center" style="padding:40px 16px;">

              <!-- Email Container -->
              <table
                class="email-card"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  max-width:640px;
                  background:#ffffff;
                  border-radius:24px;
                  overflow:hidden;
                  box-shadow:0 20px 50px rgba(15,23,42,0.10);
                "
              >

                <!-- ================= HEADER ================= -->
                <tr>
                  <td
                    class="email-header"
                    style="
                      padding:28px 40px;
                      background:#ffffff;
                      border-bottom:1px solid #e2e8f0;
                    "
                  >

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>

                        <!-- Logo -->
                        <td class="header-brand">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>

                              <td
                                style="
                                  width:40px;
                                  height:40px;
                                  background:#2563eb;
                                  border-radius:12px;
                                  text-align:center;
                                  vertical-align:middle;
                                  color:#ffffff;
                                  font-size:18px;
                                  font-weight:bold;
                                "
                              >
                                C
                              </td>

                              <td style="padding-left:10px;">
                                <div
                                  style="
                                    font-size:18px;
                                    font-weight:700;
                                    color:#0f172a;
                                  "
                                >
                                  CampusConnect
                                </div>

                                <div
                                  style="
                                    margin-top:2px;
                                    font-size:11px;
                                    color:#64748b;
                                  "
                                >
                                  Campus Placement Portal
                                </div>
                              </td>

                            </tr>
                          </table>
                        </td>

                        <!-- Badge -->
                        <td class="header-badge" align="right">
                          <span
                            style="
                              display:inline-block;
                              padding:7px 12px;
                              background:#eff6ff;
                              color:#2563eb;
                              border-radius:999px;
                              font-size:11px;
                              font-weight:700;
                            "
                          >
                            STUDENT PORTAL
                          </span>
                        </td>

                      </tr>
                    </table>

                  </td>
                </tr>


                <!-- ================= HERO ================= -->
                <tr>
                  <td
                    class="email-hero"
                    style="
                      padding:48px 40px 42px;
                      background:linear-gradient(
                        135deg,
                        #172554 0%,
                        #1d4ed8 55%,
                        #2563eb 100%
                      );
                    "
                  >

                    <div
                      style="
                        display:inline-block;
                        padding:7px 12px;
                        background:rgba(255,255,255,0.12);
                        border:1px solid rgba(255,255,255,0.18);
                        border-radius:999px;
                        color:#bfdbfe;
                        font-size:11px;
                        font-weight:bold;
                        letter-spacing:1px;
                      "
                    >
                      ACCOUNT CREATED SUCCESSFULLY
                    </div>

                    <h1
                      class="welcome-title"
                      style="
                        margin:22px 0 12px;
                        color:#ffffff;
                        font-size:36px;
                        line-height:1.15;
                        letter-spacing:-0.8px;
                      "
                    >
                      Welcome to<br />
                      CampusConnect, ${firstName}!
                    </h1>

                    <p
                      style="
                        margin:0;
                        max-width:490px;
                        color:#dbeafe;
                        font-size:15px;
                        line-height:1.7;
                      "
                    >
                      Your placement journey starts here. Discover
                      opportunities, manage applications, and stay ahead
                      of every campus placement update.
                    </p>

                  </td>
                </tr>


                <!-- ================= CONTENT ================= -->
                <tr>
                  <td class="email-content" style="padding:40px;">

                    <p
                      style="
                        margin:0 0 10px;
                        color:#0f172a;
                        font-size:20px;
                        font-weight:700;
                      "
                    >
                      Hi ${fullName} 👋
                    </p>

                    <p
                      style="
                        margin:0 0 30px;
                        color:#475569;
                        font-size:14px;
                        line-height:1.8;
                      "
                    >
                      Your CampusConnect student account is now ready.
                      You can start exploring placement opportunities and
                      keep everything related to your career journey in
                      one place.
                    </p>


                    <!-- Features -->
                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >

                      <!-- Feature 1 -->
                      <tr>
                        <td
                          class="feature-card"
                          style="
                            padding:18px;
                            background:#f8fafc;
                            border:1px solid #e2e8f0;
                            border-radius:14px;
                          "
                        >
                          <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                          >
                            <tr>

                              <td
                                class="feature-icon"
                                style="
                                  width:42px;
                                  height:42px;
                                  background:#dbeafe;
                                  border-radius:12px;
                                  text-align:center;
                                  vertical-align:middle;
                                  font-size:20px;
                                "
                              >
                                🎯
                              </td>

                              <td class="feature-copy" style="padding-left:14px;">
                                <div
                                  style="
                                    font-size:14px;
                                    font-weight:700;
                                    color:#0f172a;
                                    margin-bottom:4px;
                                  "
                                >
                                  Discover opportunities
                                </div>

                                <div
                                  style="
                                    font-size:12px;
                                    line-height:1.6;
                                    color:#64748b;
                                  "
                                >
                                  Find Full-Time, Internship and PPO
                                  opportunities that match your profile.
                                </div>
                              </td>

                            </tr>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td style="height:12px;"></td>
                      </tr>

                      <!-- Feature 2 -->
                      <tr>
                        <td
                          class="feature-card"
                          style="
                            padding:18px;
                            background:#f8fafc;
                            border:1px solid #e2e8f0;
                            border-radius:14px;
                          "
                        >
                          <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                          >
                            <tr>

                              <td
                                class="feature-icon"
                                style="
                                  width:42px;
                                  height:42px;
                                  background:#dcfce7;
                                  border-radius:12px;
                                  text-align:center;
                                  vertical-align:middle;
                                  font-size:20px;
                                "
                              >
                                📋
                              </td>

                              <td class="feature-copy" style="padding-left:14px;">
                                <div
                                  style="
                                    font-size:14px;
                                    font-weight:700;
                                    color:#0f172a;
                                    margin-bottom:4px;
                                  "
                                >
                                  Track your applications
                                </div>

                                <div
                                  style="
                                    font-size:12px;
                                    line-height:1.6;
                                    color:#64748b;
                                  "
                                >
                                  Keep track of your applications,
                                  selection stages and placement progress.
                                </div>
                              </td>

                            </tr>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td style="height:12px;"></td>
                      </tr>

                      <!-- Feature 3 -->
                      <tr>
                        <td
                          class="feature-card"
                          style="
                            padding:18px;
                            background:#f8fafc;
                            border:1px solid #e2e8f0;
                            border-radius:14px;
                          "
                        >
                          <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                          >
                            <tr>

                              <td
                                class="feature-icon"
                                style="
                                  width:42px;
                                  height:42px;
                                  background:#fef3c7;
                                  border-radius:12px;
                                  text-align:center;
                                  vertical-align:middle;
                                  font-size:20px;
                                "
                              >
                                🔔
                              </td>

                              <td class="feature-copy" style="padding-left:14px;">
                                <div
                                  style="
                                    font-size:14px;
                                    font-weight:700;
                                    color:#0f172a;
                                    margin-bottom:4px;
                                  "
                                >
                                  Never miss an update
                                </div>

                                <div
                                  style="
                                    font-size:12px;
                                    line-height:1.6;
                                    color:#64748b;
                                  "
                                >
                                  Receive important announcements and
                                  placement notifications directly.
                                </div>
                              </td>

                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>


                    <!-- CTA -->
                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="margin-top:32px;"
                    >
                      <tr>
                        <td align="center">

                          <a
                            class="welcome-cta"
                            href="${frontendUrl}/login"
                            style="
                              display:inline-block;
                              padding:15px 28px;
                              background:#2563eb;
                              color:#ffffff;
                              text-decoration:none;
                              border-radius:12px;
                              font-size:14px;
                              font-weight:700;
                              box-shadow:0 8px 20px rgba(37,99,235,0.25);
                            "
                          >
                            Open Student Portal &nbsp; →
                          </a>

                        </td>
                      </tr>
                    </table>


                    <!-- Quick Start -->
                    <div
                      class="quick-start"
                      style="
                        margin-top:32px;
                        padding:20px;
                        background:#eff6ff;
                        border:1px solid #dbeafe;
                        border-radius:16px;
                      "
                    >

                      <div
                        style="
                          color:#1d4ed8;
                          font-size:13px;
                          font-weight:700;
                          margin-bottom:8px;
                        "
                      >
                        🚀 Quick start
                      </div>

                      <div
                        style="
                          color:#475569;
                          font-size:12px;
                          line-height:1.7;
                        "
                      >
                        Complete your profile, add your academic details,
                        upload your resume, and keep your information
                        up to date to get the most out of CampusConnect.
                      </div>

                    </div>

                  </td>
                </tr>


                <!-- ================= FOOTER ================= -->
                <tr>
                  <td
                    class="email-footer"
                    style="
                      padding:28px 40px;
                      background:#f8fafc;
                      border-top:1px solid #e2e8f0;
                    "
                  >

                    <div
                      style="
                        text-align:center;
                        color:#64748b;
                        font-size:12px;
                        line-height:1.7;
                      "
                    >
                      <strong style="color:#334155;">
                        CampusConnect
                      </strong>
                      <br />

                      Your campus. Your opportunities. Your future.

                      <br /><br />

                      <span style="color:#94a3b8;">
                        This is an automated email sent because a
                        student account was created using this email address.
                      </span>

                      <br />

                      <span style="color:#94a3b8;">
                        Please do not reply to this email.
                      </span>
                    </div>

                  </td>
                </tr>

              </table>

              <!-- Bottom Text -->
              <div
                style="
                  margin-top:18px;
                  color:#94a3b8;
                  font-size:11px;
                  text-align:center;
                "
              >
                © ${new Date().getFullYear()} CampusConnect
              </div>

            </td>
          </tr>
        </table>

      </body>
    </html>
  `;
}

async function sendWelcomeEmail({ email, firstName, lastName }) {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      "Welcome email skipped: SMTP environment variables are not configured",
    );
    return false;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: `Welcome to CampusConnect, ${firstName}`,
    text: `Welcome to CampusConnect, ${firstName}. Your student account is ready: ${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
    html: welcomeEmailHtml({ firstName, lastName }),
  });

  return true;
}

async function sendRegistrationOtpEmail({ email, otp }) {
  const transporter = getTransporter();

  if (!transporter) {
    throw new Error("SMTP environment variables are not configured");
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Your CampusConnect verification code",
    text: `Your CampusConnect verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a">
        <h2>Verify your CampusConnect account</h2>
        <p>Use this one-time verification code to complete registration:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px">${otp}</p>
        <p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}

async function sendPasswordResetOtpEmail({ email, otp }) {
  const transporter = getTransporter();

  if (!transporter) {
    throw new Error("SMTP environment variables are not configured");
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Your CampusConnect password reset code",
    text: `Your CampusConnect password reset code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a">
        <h2>Reset your CampusConnect password</h2>
        <p>Use this one-time code to choose a new password:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px">${otp}</p>
        <p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}

module.exports = {
  sendWelcomeEmail,
  sendRegistrationOtpEmail,
  sendPasswordResetOtpEmail,
};

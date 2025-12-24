import nodemailer from 'nodemailer';

// Create a transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send interview added email
export const sendInterviewAddedEmail = async (userEmail, planDetails) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: '📅 Interview Scheduled - ResuMate',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                 color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .detail-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
                        .label { font-weight: bold; color: #667eea; }
                        .value { color: #333; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Interview Scheduled!</h1>
                        </div>
                        <div class="content">
                            <p>Great news! A new interview has been added to your planner.</p>
                            
                            <div class="detail-row">
                                <span class="label">🏢 Company:</span>
                                <span class="value">${planDetails.companyName}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">💼 Position:</span>
                                <span class="value">${planDetails.position}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">📅 Date:</span>
                                <span class="value">${new Date(planDetails.date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">⏰ Time:</span>
                                <span class="value">${planDetails.time}</span>
                            </div>
                            
                            ${planDetails.location ? `
                            <div class="detail-row">
                                <span class="label">📍 Location:</span>
                                <span class="value">${planDetails.location}</span>
                            </div>
                            ` : ''}
                            
                            ${planDetails.notes ? `
                            <div class="detail-row">
                                <span class="label">📝 Notes:</span>
                                <span class="value">${planDetails.notes}</span>
                            </div>
                            ` : ''}
                            
                            <p style="margin-top: 30px; color: #667eea; font-weight: bold;">
                                Good luck with your interview! 🍀
                            </p>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification from ResuMate.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Interview added email sent successfully to:', userEmail);
        return { success: true };
    } catch (error) {
        console.error('Error sending interview added email:', error);
        return { success: false, error: error.message };
    }
};

// Send interview deleted email
export const sendInterviewDeletedEmail = async (userEmail, planDetails) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: '🗑️ Interview Removed - ResuMate',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                                 color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .detail-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
                        .label { font-weight: bold; color: #f5576c; }
                        .value { color: #333; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Interview Removed</h1>
                        </div>
                        <div class="content">
                            <p>The following interview has been removed from your planner:</p>
                            
                            <div class="detail-row">
                                <span class="label">🏢 Company:</span>
                                <span class="value">${planDetails.companyName}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">💼 Position:</span>
                                <span class="value">${planDetails.position}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">📅 Date:</span>
                                <span class="value">${new Date(planDetails.date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">⏰ Time:</span>
                                <span class="value">${planDetails.time}</span>
                            </div>
                            
                            <p style="margin-top: 30px; color: #666;">
                                This interview plan has been successfully removed from your schedule.
                            </p>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification from ResuMate.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Interview deleted email sent successfully to:', userEmail);
        return { success: true };
    } catch (error) {
        console.error('Error sending interview deleted email:', error);
        return { success: false, error: error.message };
    }
};

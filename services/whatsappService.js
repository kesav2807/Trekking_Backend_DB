const axios = require('axios');

class WhatsAppService {
    constructor() {
        this.token = process.env.META_WA_ACCESS_TOKEN;
        this.phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;
        this.baseUrl = `https://graph.facebook.com/v22.0/${this.phoneNumberId}/messages`;
    }

    async sendWithRetry(to, body, mediaUrl = null) {
        if (!this.token || !this.phoneNumberId) {
            console.warn("[Meta Dispatch] Mission Control offline. Authorization required.");
            console.log(`[Manual Log] To: ${to}\nMessage: ${body}\nMedia: ${mediaUrl}`);
            return { success: true };
        }

        try {
            const data = {
                messaging_product: "whatsapp",
                to: to,
                type: mediaUrl ? "image" : "text",
            };

            if (mediaUrl) {
                data.image = {
                    link: mediaUrl,
                    caption: body
                };
            } else {
                data.text = { body: body };
            }

            const response = await axios.post(this.baseUrl, data, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`[Meta Dispatch] Transmission SUCCESS: ${response.data.messages[0].id}`);
            return { success: true, messageId: response.data.messages[0].id };
        } catch (error) {
            const metaError = error.response?.data?.error;
            console.error(`[Meta Dispatch] Transmission FAILURE:`, metaError || error.message);
            
            let descriptiveReason = metaError?.message || error.message;
            if (metaError?.code === 131030) {
                descriptiveReason = "SANDBOX_RESTRICTION: This phone number is not yet on your Meta Recipient Allow-List. Please add it in your Meta App Developer Dashboard under WhatsApp > API Setup > To.";
            }

            return { success: false, reason: descriptiveReason };
        }
    }

    // 🔹 User Notification
    async sendBookingConfirmation(user, booking, trip) {
        const message = `🔔 *EXPEDITION AUTHORIZED*\n\nExplorer: ${user.name}\nMission: ${trip.title}\nID: ${booking._id.toString().slice(-8).toUpperCase()}\n\nSafe travels from TTDC Expedition Hub.`;
        return this.sendWithRetry(user.phone, message);
    }

    // 🔹 Admin Notification
    async sendAdminAlert(user, booking, trip) {
        const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
        const message = `🚨 *NEW HUB ENTRY*\n\nUser: ${user.name}\nMission: ${trip.title}\nAmt: ₹${booking.totalAmount}\n\nReview in Dispatch Terminal.`;
        return this.sendWithRetry(adminPhone, message);
    }

    // 🔹 Direct Ticket Dispatch (Used for high-fidelity ticket images)
    async sendDirectMessage(to, message, mediaUrl = null) {
        return this.sendWithRetry(to, message, mediaUrl);
    }
}

module.exports = new WhatsAppService();

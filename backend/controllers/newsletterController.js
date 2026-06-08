const NewsletterSubscriber = require('../models/NewsletterSubscriber');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Por favor, adicione um e-mail' });
    }

    let subscriber = await NewsletterSubscriber.findOne({ email });

    if (subscriber) {
      if (subscriber.active) {
        return res.status(400).json({ success: false, error: 'Este e-mail já está subscrito na nossa newsletter.' });
      } else {
        // Re-activate subscription
        subscriber.active = true;
        await subscriber.save();
        return res.status(200).json({ success: true, message: 'Subscrição reativada com sucesso!', data: subscriber });
      }
    }

    subscriber = await NewsletterSubscriber.create({ email });

    res.status(201).json({ success: true, message: 'Subscrição efetuada com sucesso!', data: subscriber });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Por favor, indique o seu e-mail' });
    }

    const subscriber = await NewsletterSubscriber.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({ success: false, error: 'E-mail não encontrado nos nossos subscritores.' });
    }

    subscriber.active = false;
    await subscriber.save();

    res.status(200).json({ success: true, message: 'Cancelamento de subscrição efetuado com sucesso.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all newsletter subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: subscribers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Toggle subscriber status (Activate/Deactivate)
// @route   PUT /api/newsletter/subscribers/:id/toggle
// @access  Private/Admin
exports.toggleSubscriberStatus = async (req, res) => {
  try {
    const subscriber = await NewsletterSubscriber.findById(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ success: false, error: `Subscritor não encontrado com o ID ${req.params.id}` });
    }

    subscriber.active = !subscriber.active;
    await subscriber.save();

    res.status(200).json({ success: true, data: subscriber });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a newsletter subscriber
// @route   DELETE /api/newsletter/subscribers/:id
// @access  Private/Admin
exports.deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await NewsletterSubscriber.findById(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ success: false, error: `Subscritor não encontrado com o ID ${req.params.id}` });
    }

    await NewsletterSubscriber.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

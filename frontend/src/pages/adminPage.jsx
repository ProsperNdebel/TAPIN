// frontend/src/pages/adminPage.jsx

import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { api, getCategories } from "../services/api";
import {
  getAllScrapers,
  createScraper,
  updateScraper,
  deleteScraper,
  toggleScraper,
  testScraper,
} from "../services/api";
import "./AdminPage.css";

function AdminPage() {
  const [activeTab, setActiveTab] = useState("trends");

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>TAPIN Admin Panel</h1>
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "trends" ? "active" : ""}`}
            onClick={() => setActiveTab("trends")}
          >
            Manage Trends
          </button>
          <button
            className={`tab-btn ${activeTab === "scrapers" ? "active" : ""}`}
            onClick={() => setActiveTab("scrapers")}
          >
            Manage Scrapers
          </button>
        </div>
      </div>

      {activeTab === "trends" && <TrendManagement />}
      {activeTab === "scrapers" && <ScraperManagement />}
    </div>
  );
}

function TrendManagement() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    why_it_matters: "",
    how_to_talk_about_it: "",
    category_id: "",
    relevance_score: 0.85,
    sources: "",
    week_start: "",
    week_end: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be signed in");
        return;
      }

      const token = await user.getIdToken();

      await api.post("/admin/trends", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Trend created successfully! ✅");

      setForm({
        title: "",
        description: "",
        why_it_matters: "",
        how_to_talk_about_it: "",
        category_id: "",
        relevance_score: 0.85,
        sources: "",
        week_start: "",
        week_end: "",
      });
    } catch (err) {
      console.error("Error creating trend:", err);
      alert(`Error: ${err.response?.data?.detail || "Failed to create trend"}`);
    }
  };

  return (
    <div className="admin-card">
      <h2 className="admin-title">Create New Trend</h2>
      <p className="admin-subtitle">Add manually curated trends to TAPIN</p>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Title *</label>
          <input
            name="title"
            placeholder="e.g., Rizz, NPC Streaming, Brat Summer"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            placeholder="Brief explanation of what this trend is..."
            value={form.description}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Why It Matters</label>
          <textarea
            name="why_it_matters"
            placeholder="Why should parents/teachers care about this?"
            value={form.why_it_matters}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>How to Talk About It</label>
          <textarea
            name="how_to_talk_about_it"
            placeholder="Tips for starting conversations with Gen Z about this..."
            value={form.how_to_talk_about_it}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
            >
              <option value="">Select Category (Optional)</option>
              {Array.isArray(categories) &&
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>Relevance Score</label>
            <input
              type="number"
              name="relevance_score"
              value={form.relevance_score}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Sources</label>
          <input
            name="sources"
            placeholder="URLs, comma separated"
            value={form.sources}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Week Start</label>
            <input
              type="date"
              name="week_start"
              value={form.week_start}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Week End</label>
            <input
              type="date"
              name="week_end"
              value={form.week_end}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="admin-submit-btn">
          Create Trend
        </button>
      </form>
    </div>
  );
}

function ScraperManagement() {
  const [scrapers, setScrapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    template: "news_site",
    url: "",
    base_url: "",
    selectors: '{"article_link": "article a"}',
    enabled: true,
    limit: 10,
  });

  useEffect(() => {
    fetchScrapers();
  }, []);

  const fetchScrapers = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();
      const data = await getAllScrapers(token);
      setScrapers(data.scrapers);
    } catch (err) {
      console.error("Failed to fetch scrapers:", err);
      alert("Failed to load scrapers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await auth.currentUser.getIdToken();

      let parsedSelectors;
      try {
        parsedSelectors = JSON.parse(formData.selectors);
      } catch (err) {
        alert("Invalid JSON for selectors", err);
        return;
      }

      const scraperData = {
        name: formData.name,
        template: formData.template,
        url: formData.url,
        base_url: formData.base_url || null,
        selectors: parsedSelectors,
        enabled: formData.enabled,
        limit: parseInt(formData.limit),
      };

      if (editingId) {
        await updateScraper(editingId, scraperData, token);
        alert("Scraper updated successfully!");
      } else {
        await createScraper(scraperData, token);
        alert("Scraper created successfully!");
      }

      fetchScrapers();
      resetForm();
    } catch (err) {
      alert(
        "Failed to save scraper: " +
          (err.response?.data?.detail || err.message),
      );
    }
  };

  const handleEdit = (scraper) => {
    setFormData({
      name: scraper.name,
      template: scraper.template,
      url: scraper.url,
      base_url: scraper.base_url || "",
      selectors: JSON.stringify(scraper.selectors, null, 2),
      enabled: scraper.enabled,
      limit: scraper.limit,
    });
    setEditingId(scraper.id);
    setShowAddForm(true);
  };

  const handleToggle = async (id) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await toggleScraper(id, token);
      fetchScrapers();
    } catch (err) {
      alert("Failed to toggle scraper", err);
    }
  };

  const handleTest = async (id) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const result = await testScraper(id, token);

      if (result.success) {
        alert(
          `${result.message}\n\nPreview:\n${JSON.stringify(result.items, null, 2)}`,
        );
      } else {
        alert(`Test failed: ${result.error}`);
      }
    } catch (err) {
      alert("Test failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this scraper?")) return;

    try {
      const token = await auth.currentUser.getIdToken();
      await deleteScraper(id, token);
      fetchScrapers();
      alert("Scraper deleted successfully!");
    } catch (err) {
      alert("Failed to delete scraper", err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      template: "news_site",
      url: "",
      base_url: "",
      selectors: '{"article_link": "article a"}',
      enabled: true,
      limit: 10,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (loading) return <div className="loading">Loading scrapers...</div>;

  return (
    <div className="admin-card">
      <div className="card-header">
        <h2 className="admin-title">Scraper Management</h2>
        <button
          className="add-scraper-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "+ Add New Scraper"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="scraper-form">
          <h3>{editingId ? "Edit Scraper" : "Add New Scraper"}</h3>

          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              placeholder="e.g., buzzfeed"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={editingId !== null}
            />
          </div>

          <div className="form-group">
            <label>Template *</label>
            <select
              value={formData.template}
              onChange={(e) =>
                setFormData({ ...formData, template: e.target.value })
              }
            >
              <option value="news_site">News Site</option>
              <option value="simple_html">Simple HTML</option>
              <option value="reddit_style">Reddit Style</option>
            </select>
          </div>

          <div className="form-group">
            <label>URL *</label>
            <input
              type="url"
              placeholder="https://www.example.com/trending"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Base URL (optional)</label>
            <input
              type="url"
              placeholder="https://www.example.com"
              value={formData.base_url}
              onChange={(e) =>
                setFormData({ ...formData, base_url: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Selectors (JSON) *</label>
            <textarea
              rows="5"
              placeholder='{"article_link": "article a", "title": "h2"}'
              value={formData.selectors}
              onChange={(e) =>
                setFormData({ ...formData, selectors: e.target.value })
              }
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Limit</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.limit}
                onChange={(e) =>
                  setFormData({ ...formData, limit: e.target.value })
                }
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, enabled: e.target.checked })
                  }
                />
                Enabled
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="admin-submit-btn">
              {editingId ? "Update Scraper" : "Create Scraper"}
            </button>
            <button type="button" onClick={resetForm} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="scrapers-list">
        <h3>All Scrapers ({scrapers.length})</h3>

        {scrapers.length === 0 ? (
          <p className="empty-state">
            No scrapers configured yet. Add one to get started!
          </p>
        ) : (
          <div className="scrapers-grid">
            {scrapers.map((scraper) => (
              <div key={scraper.id} className="scraper-card">
                <div className="scraper-header">
                  <h4>{scraper.name}</h4>
                  <span
                    className={`status ${scraper.enabled ? "enabled" : "disabled"}`}
                  >
                    {scraper.enabled ? "✅" : "⏸️"}
                  </span>
                </div>

                <div className="scraper-details">
                  <p>
                    <strong>Template:</strong> {scraper.template}
                  </p>
                  <p>
                    <strong>URL:</strong>{" "}
                    <a href={scraper.url} target="_blank" rel="noopener">
                      {scraper.url.substring(0, 50)}...
                    </a>
                  </p>
                  <p>
                    <strong>Limit:</strong> {scraper.limit} items
                  </p>
                </div>

                <div className="scraper-actions">
                  <button
                    onClick={() => handleEdit(scraper)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggle(scraper.id)}
                    className="toggle-btn"
                  >
                    {scraper.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleTest(scraper.id)}
                    className="test-btn"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleDelete(scraper.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;

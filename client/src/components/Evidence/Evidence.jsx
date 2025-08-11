import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Plus, 
  Search, 
  Edit2, 
  Eye, 
  RotateCcw,
  FileText,
  Calendar,
  MapPin,
  Package,
  Shield,
  Link
} from 'lucide-react';
import './Evidence.css';

const Evidence = () => {
  const [evidence, setEvidence] = useState([]);
  const [cases, setCases] = useState([]);
  const [obEntries, setObEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'detail', 'edit'
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const evidenceTypes = ['Physical', 'Digital', 'Document', 'Photo', 'Video', 'Audio', 'Other'];
  const evidenceStatuses = ['Collected', 'Analyzed', 'Stored', 'Disposed', 'Missing'];

  const fetchEvidence = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/evidence');
      if (response.ok) {
        const data = await response.json();
        setEvidence(data.evidence || []);
        setError('');
      } else {
        setError('Failed to fetch evidence');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases');
      if (response.ok) {
        const data = await response.json();
        setCases(data.cases || []);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    }
  };

  const fetchOBEntries = async () => {
    try {
      const response = await fetch('/api/ob-entries');
      if (response.ok) {
        const data = await response.json();
        setObEntries(data.obEntries || []);
      }
    } catch (error) {
      console.error('Failed to fetch OB entries:', error);
    }
  };

  useEffect(() => {
    fetchEvidence();
    fetchCases();
    fetchOBEntries();
  }, []);

  const filteredEvidence = evidence.filter(item => {
    const matchesSearch = 
      item.evidenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || item.type === typeFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const navigateToView = (view, evidenceItem = null) => {
    setCurrentView(view);
    setSelectedEvidence(evidenceItem);
  };

  const goBack = () => {
    if (currentView === 'detail') {
      setCurrentView('list');
    } else if (currentView === 'edit') {
      setCurrentView('detail');
    } else {
      setCurrentView('list');
    }
    if (currentView === 'create') {
      setSelectedEvidence(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'collected': return <Package size={16} className="status-collected" />;
      case 'analyzed': return <Eye size={16} className="status-analyzed" />;
      case 'stored': return <Shield size={16} className="status-stored" />;
      case 'disposed': return <FileText size={16} className="status-disposed" />;
      case 'missing': return <Search size={16} className="status-missing" />;
      default: return <Package size={16} />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'physical': return <Package size={16} />;
      case 'digital': return <FileText size={16} />;
      case 'document': return <FileText size={16} />;
      case 'photo': return <Camera size={16} />;
      case 'video': return <Camera size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const EvidenceList = () => (
    <div className="evidence-list">
      <div className="evidence-header">
        <div className="header-content">
          <Camera className="header-icon" />
          <div>
            <h1>Evidence Log</h1>
            <p>Manage evidence collection and chain of custody</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={fetchEvidence}
            disabled={isLoading}
            title="Refresh evidence list"
          >
            <RotateCcw size={18} className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
          <button className="add-evidence-btn" onClick={() => navigateToView('create')}>
            <Plus size={18} />
            Add Evidence
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search evidence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {evidenceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {evidenceStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="evidence-grid">
        {isLoading ? (
          <div className="loading-state">Loading evidence...</div>
        ) : filteredEvidence.length === 0 ? (
          <div className="empty-state">
            <Camera size={48} />
            <h3>No evidence found</h3>
            <p>Add new evidence or adjust your search filters</p>
          </div>
        ) : (
          filteredEvidence.map((evidenceItem) => (
            <div key={evidenceItem.id} className="evidence-card" onClick={() => navigateToView('detail', evidenceItem)}>
              <div className="evidence-header">
                <div className="evidence-info">
                  <h3>{evidenceItem.evidenceNumber}</h3>
                  <p className="evidence-description">{evidenceItem.description}</p>
                </div>
                <div className="evidence-type">
                  {getTypeIcon(evidenceItem.type)}
                  <span>{evidenceItem.type}</span>
                </div>
              </div>
              <div className="evidence-body">
                <div className="status-row">
                  {getStatusIcon(evidenceItem.status)}
                  <span className="status-text">{evidenceItem.status}</span>
                </div>
                <div className="evidence-details">
                  <p><strong>Location:</strong> {evidenceItem.location}</p>
                  <p><strong>Collected:</strong> {new Date(evidenceItem.collectedAt).toLocaleDateString()}</p>
                  {evidenceItem.caseId && (
                    <p className="linked-case">
                      <Link size={14} />
                      <span>Linked to Case</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const CreateEvidenceForm = () => {
    const [formData, setFormData] = useState({
      type: 'Physical',
      description: '',
      location: '',
      chain_of_custody: '',
      status: 'Collected',
      collectedAt: new Date().toISOString().split('T')[0],
      caseId: '',
      obId: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
      if (!formData.collectedAt) newErrors.collectedAt = 'Collection date is required';
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const response = await fetch('/api/evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          await fetchEvidence();
          goBack();
        } else {
          const errorData = await response.json();
          setErrors({ submit: errorData.message || 'Failed to add evidence' });
        }
      } catch (error) {
        setErrors({ submit: 'Network error. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="evidence-form-container">
        <div className="form-header">
          <button className="back-btn" onClick={goBack}>
            <Camera size={20} />
            Back to Evidence
          </button>
          <h1>Add New Evidence</h1>
        </div>

        <form onSubmit={handleSubmit} className="evidence-creation-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="type">Evidence Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                {evidenceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                {evidenceStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="collectedAt">Collection Date *</label>
              <input
                type="date"
                id="collectedAt"
                name="collectedAt"
                value={formData.collectedAt}
                onChange={handleInputChange}
                className={errors.collectedAt ? 'error' : ''}
              />
              {errors.collectedAt && <span className="error-text">{errors.collectedAt}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="caseId">Linked Case (Optional)</label>
              <select
                id="caseId"
                name="caseId"
                value={formData.caseId}
                onChange={handleInputChange}
              >
                <option value="">Select a case...</option>
                {cases.map(caseItem => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.caseNumber} - {caseItem.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="obId">Linked OB Entry (Optional)</label>
              <select
                id="obId"
                name="obId"
                value={formData.obId}
                onChange={handleInputChange}
              >
                <option value="">Select an OB entry...</option>
                {obEntries.map(ob => (
                  <option key={ob.id} value={ob.id}>
                    {ob.obNumber} - {ob.type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter collection location"
              className={errors.location ? 'error' : ''}
            />
            {errors.location && <span className="error-text">{errors.location}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter detailed evidence description"
              rows="4"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="chain_of_custody">Chain of Custody</label>
            <textarea
              id="chain_of_custody"
              name="chain_of_custody"
              value={formData.chain_of_custody}
              onChange={handleInputChange}
              placeholder="Enter chain of custody information"
              rows="3"
            />
          </div>

          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={goBack}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Evidence'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const EvidenceDetail = () => {
    const linkedCase = cases.find(c => c.id === selectedEvidence?.caseId);
    const linkedOB = obEntries.find(ob => ob.id === selectedEvidence?.obId);

    return (
      <div className="evidence-detail">
        <div className="detail-header">
          <button className="back-btn" onClick={goBack}>
            <Camera size={20} />
            Back to Evidence
          </button>
          <div className="detail-actions">
            <button onClick={() => navigateToView('edit', selectedEvidence)}>
              <Edit2 size={16} />
              Edit Evidence
            </button>
          </div>
        </div>
        
        <div className="evidence-info-panel">
          <div className="panel-header">
            <div className="evidence-display">
              <Camera size={32} />
              <h1>{selectedEvidence?.evidenceNumber}</h1>
              <div className="status-badge">
                {getStatusIcon(selectedEvidence?.status)}
                {selectedEvidence?.status}
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <h3>Evidence Information</h3>
              <div className="info-grid">
                <div><strong>Type:</strong> {selectedEvidence?.type}</div>
                <div><strong>Status:</strong> {selectedEvidence?.status}</div>
                <div><strong>Location:</strong> {selectedEvidence?.location}</div>
                <div><strong>Collected:</strong> {new Date(selectedEvidence?.collectedAt).toLocaleString()}</div>
                <div><strong>Added:</strong> {new Date(selectedEvidence?.createdAt).toLocaleString()}</div>
                <div><strong>Updated:</strong> {new Date(selectedEvidence?.updatedAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Description</h3>
              <p className="evidence-description">{selectedEvidence?.description}</p>
            </div>

            {selectedEvidence?.chain_of_custody && (
              <div className="detail-section">
                <h3>Chain of Custody</h3>
                <p className="custody-info">{selectedEvidence.chain_of_custody}</p>
              </div>
            )}

            <div className="detail-section">
              <h3>Linked Records</h3>
              <div className="linked-records">
                {linkedCase && (
                  <div className="linked-item">
                    <FileText size={16} />
                    <span>Case: {linkedCase.caseNumber} - {linkedCase.title}</span>
                  </div>
                )}
                {linkedOB && (
                  <div className="linked-item">
                    <FileText size={16} />
                    <span>OB: {linkedOB.obNumber} - {linkedOB.type}</span>
                  </div>
                )}
                {!linkedCase && !linkedOB && (
                  <p className="no-links">No linked records found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  switch (currentView) {
    case 'detail':
      return <EvidenceDetail />;
    case 'create':
      return <CreateEvidenceForm />;
    default:
      return <EvidenceList />;
  }
};

export default Evidence;
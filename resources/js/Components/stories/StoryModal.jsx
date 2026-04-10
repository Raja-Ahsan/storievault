import { useState, useEffect, useRef } from 'react';
import { Tab, Nav } from 'react-bootstrap';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';

const StoryModal = ({ show, onHide, story, ratings = [] }) => {
  const { auth } = usePage().props;
  const [activeTab, setActiveTab] = useState('continue');
  const [storyContent, setStoryContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const editorRef = useRef(null);
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [characterDetails, setCharacterDetails] = useState(null);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [showLimitExceededModal, setShowLimitExceededModal] = useState(false);
  const [dailyWordUsage, setDailyWordUsage] = useState(0);
  const [monthlyStoryUsage, setMonthlyStoryUsage] = useState(0);
  const [selectedRating, setSelectedRating] = useState('');

  // Check if user has active subscription
  const hasActiveSubscription = auth.user?.subscription?.stripe_status === 'active';

  // Rating options from database
  const ratingOptions = ratings.map(rating => ({
    value: rating.id,
    label: rating.name
  }));

  // Reset state when modal is opened
  useEffect(() => {
    if (show) {
      setStoryContent('');
      setWordCount(0);
      setSelectedCharacter('');
      setCharacterDetails(null);
      setShowLimitExceededModal(false);
      // Set default rating from the original story
      setSelectedRating(story?.rating_id || ratings.find(r => r.name === 'PG')?.id || '');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }

      // Load drafts when the modal is opened
      if (auth.user) {
        loadDrafts();
        loadUsageData();
      }
    }
  }, [show, story?.rating_id]);

  // Load drafts from the API
  const loadDrafts = async () => {
    if (!auth.user) return;

    setIsLoadingDrafts(true);

    try {
      const response = await axios.get(route('drafts.index'));

      if (response.data && response.data.drafts) {
        // Format the drafts to match our expected structure
        const formattedDrafts = response.data.drafts.map(draft => ({
          id: draft.id,
          title: draft.title,
          content: draft.content,
          htmlContent: draft.html_content,
          character: draft.character,
          characterId: draft.character_id,
          date: new Date(draft.created_at).toLocaleDateString(),
          wordCount: draft.word_count
        }));

        setSavedDrafts(formattedDrafts);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  // Load usage data from the API
  const loadUsageData = async () => {
    if (!auth.user || !auth.user.subscription) return;

    // Debug: Log subscription and package data
    console.log('Auth user subscription:', auth.user.subscription);
    console.log('Package data:', auth.user.subscription.package);
    console.log('Words limit:', auth.user.subscription.package?.words_limit);
    console.log('Stories limit:', auth.user.subscription.package?.stories_limit);

    try {
      const response = await axios.get(route('usage.data'));
      if (response.data) {
        setDailyWordUsage(response.data.daily_words || 0);
        setMonthlyStoryUsage(response.data.monthly_stories || 0);
      }
    } catch (error) {
      console.error('Error loading usage data:', error);
    }
  };

  // Check if user has exceeded daily word limit
  const hasExceededDailyWordLimit = () => {
    if (!auth.user?.subscription?.package) return false;
    
    const packageWordsLimit = auth.user.subscription.package.words_limit;
    if (!packageWordsLimit) return false;
    
    return dailyWordUsage >= packageWordsLimit;
  };

  // Check if user has exceeded monthly story limit
  const hasExceededMonthlyStoryLimit = () => {
    if (!auth.user?.subscription?.package) return false;
    
    const packageStoriesLimit = auth.user.subscription.package.stories_limit;
    if (!packageStoriesLimit) return false;
    
    return monthlyStoryUsage >= packageStoriesLimit;
  };

  // Check if user can add more words today
  const canAddWords = () => {
    if (!auth.user?.subscription?.package) return false;
    
    const packageWordsLimit = auth.user.subscription.package.words_limit;
    if (!packageWordsLimit) return false;
    
    // Check if adding the current story content would exceed the limit
    const currentStoryWords = wordCount;
    return (dailyWordUsage + currentStoryWords) <= packageWordsLimit;
  };

  // Check if user can add a specific draft to community
  const canAddDraftToCommunity = (draft) => {
    if (!auth.user?.subscription?.package) return false;
    
    const packageWordsLimit = auth.user.subscription.package.words_limit;
    if (!packageWordsLimit) return false;
    
    // Check if adding the draft would exceed the limit
    const draftWords = draft.wordCount || 0;
    return (dailyWordUsage + draftWords) <= packageWordsLimit;
  };

  // Check if user can add more stories this month
  const canAddStories = () => {
    if (!auth.user?.subscription?.package) return false;
    
    const packageStoriesLimit = auth.user.subscription.package.stories_limit;
    if (!packageStoriesLimit) return false;
    
    return monthlyStoryUsage < packageStoriesLimit;
  };

  // Initialize editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.addEventListener('input', handleEditorChange);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('input', handleEditorChange);
      }
    };
  }, []);

  // Handle character selection
  const handleCharacterChange = (e) => {
    const characterId = e.target.value;
    setSelectedCharacter(characterId);

    if (characterId && story?.characters) {
      const character = story.characters.find(c => c.id.toString() === characterId);
      setCharacterDetails(character || null);

      // Add original story text to the editor when a character is selected
      if (character && editorRef.current) {
        // Create a formatted story starter with the character's perspective
        const storyStarter = `
          <p><strong>${story.title}</strong> - Continued from ${character.name}'s perspective</p>
          <p><em>${story.description.substring(0, 200)}...</em></p>
          <hr>
          <p>As ${character.name}, I...</p>
        `;

        // Set the HTML content in the editor
        editorRef.current.innerHTML = storyStarter;

        // Update the story content and word count
        const content = editorRef.current.innerText;
        setStoryContent(content);
        const words = content.trim() ? content.trim().split(/\s+/) : [];
        setWordCount(words.length);
      }
    } else {
      setCharacterDetails(null);

      // Clear the editor if no character is selected
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        setStoryContent('');
        setWordCount(0);
      }
    }
  };

  // Handle editor content change
  const handleEditorChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerText;
      setStoryContent(content);

      // Calculate word count
      const words = content.trim() ? content.trim().split(/\s+/) : [];
      setWordCount(words.length);
    }
  };

  // Check if the story is ready for community
  const isReadyForCommunity = () => {
    // Check if character is selected
    if (!selectedCharacter) return false;
    
    // Check if editor has content
    if (!storyContent.trim().length) return false;
    
    // Get the character
    const character = story?.characters?.find(c => c.id.toString() === selectedCharacter);
    if (!character) return false;
    
    // Check if the content contains the character's perspective text
    const characterPerspectiveText = `As ${character.name}, I`;
    return storyContent.includes(characterPerspectiveText);
  };

  // Handle adding to community
  const handleAddToCommunity = async () => {
    // Check if user has active subscription
    if (!hasActiveSubscription) {
      alert('Please subscribe first to use this feature. You need an active subscription to add stories to the community.');
      return;
    }

    // Check daily word limit
    if (hasExceededDailyWordLimit()) {
      setShowLimitExceededModal(true);
      return;
    }

    // Check monthly story limit
    if (hasExceededMonthlyStoryLimit()) {
      alert('You have reached your monthly story limit. Please wait until next month or upgrade your subscription.');
      return;
    }

    // Check if user can add more words today
    if (!canAddWords()) {
      setShowLimitExceededModal(true);
      return;
    }

    setIsLoading(true);

    try {
      // Get the content from the editor
      const content = editorRef.current ? editorRef.current.innerHTML : '';

      // Prepare the data for the API call
      const data = {
        // title: `${story.title} - Continued by ${selectedCharacter ? `${characterDetails.name}` : 'User'}`,
        title: `${story.title}`,
        content: content,
        character_id: selectedCharacter || null,
        original_story_id: story.id,
        rating: selectedRating,
      };


      // Make the API call
      const response = await axios.post(route('community.store'), data);

      if (response.data.success) {
        // Update usage data after successful submission
        await loadUsageData();
        
        // Redirect to the community story page
        window.location.href = route('community.show', response.data.story.id);
      } else {
        alert('Failed to add story to community. Please try again.');
      }
    } catch (error) {
      console.error('Error adding story to community:', error);
      alert('Failed to add story to community. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding to community from draft
  const handleAddToCommunityFromDraft = async (draft) => {
    // Check if user has active subscription
    if (!hasActiveSubscription) {
      alert('Please subscribe first to use this feature. You need an active subscription to add stories to the community.');
      return;
    }

    // Check daily word limit
    if (hasExceededDailyWordLimit()) {
      setShowLimitExceededModal(true);
      return;
    }

    // Check monthly story limit
    if (hasExceededMonthlyStoryLimit()) {
      alert('You have reached your monthly story limit. Please wait until next month or upgrade your subscription.');
      return;
    }

    // Check if user can add more words today
    if (!canAddWords()) {
      setShowLimitExceededModal(true);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the data for the API call
      const data = {
        title: `${story.title} - Continued from Draft`,
        content: draft.htmlContent || `<p>${draft.content}</p>`,
        character_id: draft.characterId || null,
        original_story_id: story.id,
        rating: selectedRating,
      };

      // Make the API call
      const response = await axios.post(route('community.store'), data);

      if (response.data.success) {
        // Update usage data after successful submission
        await loadUsageData();
        
        // Redirect to the community story page
        window.location.href = route('community.show', response.data.story.id);
      } else {
        alert('Failed to add story to community. Please try again.');
      }
    } catch (error) {
      console.error('Error adding story to community:', error);
      alert('Failed to add story to community. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format text
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  // Save draft
  const handleSaveDraft = async () => {
    // Connect to the backend to save the draft
    setIsLoading(true);

    try {
      const draftData = {
        story_id: story.id,
        character_id: selectedCharacter || null,
        title: `Draft of ${story.title}`,
        content: storyContent,
        html_content: editorRef.current ? editorRef.current.innerHTML : '',
        word_count: wordCount
      };

      const response = await axios.post(route('drafts.store'), draftData);

      if (response.data && response.data.draft) {
        // Format the draft to match our expected structure
        const newDraft = {
          id: response.data.draft.id,
          title: response.data.draft.title,
          content: response.data.draft.content,
          htmlContent: response.data.draft.html_content,
          character: response.data.draft.character,
          characterId: response.data.draft.character_id,
          date: new Date(response.data.draft.created_at).toLocaleDateString(),
          wordCount: response.data.draft.word_count
        };

        // Add the new draft to the list
        setSavedDrafts([newDraft, ...savedDrafts]);

        // Show success message
        alert('Draft saved successfully!');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Publish story from editor
  const handlePublish = () => {
    // Get user data from the auth prop
    const user = auth.user;

    // Check if user is not logged in
    if (!user) {
      router.visit(route('login'));
      return;
    }

    // Check if user is a guest (is_guest = 1)
    if (user.is_guest) {
      router.visit(route('register'));
      return;
    }

    // Check if user account is inactive (is_active = 0)
    if (!user.is_active) {
      router.visit(route('login'));
      return;
    }

    setIsLoading(true)
  
    router.post(route('story.draft.session'), {
      story_id: story.id,
      character_name: characterDetails.name,
      content: storyContent,
    }, {
      onFinish: () => setIsLoading(false),
    })
  }



  // Publish draft
  const handlePublishDraft = (draft) => {
    // Get user data from the auth prop
    const user = auth.user;

    // Check if user is not logged in
    if (!user) {
      router.visit(route('login'));
      return;
    }

    // Check if user is a guest (is_guest = 1)
    if (user.is_guest) {
      router.visit(route('register'));
      return;
    }

    // Check if user account is inactive (is_active = 0)
    if (!user.is_active) {
      router.visit(route('login'));
      return;
    }

    // This would connect to your backend in a real implementation
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      alert(`Your draft "${draft.title}" has been published!`);
      setIsLoading(false);

      // Remove from drafts after publishing
      setSavedDrafts(savedDrafts.filter(d => d.id !== draft.id));
    }, 500);
  };

  // Edit draft
  const handleEditDraft = (draft) => {
    setActiveTab('continue');
    setSelectedCharacter(draft.characterId);

    // Find the character
    if (story?.characters) {
      const character = story.characters.find(c => c.id.toString() === draft.characterId);
      setCharacterDetails(character || null);
    }

    // Set HTML content in editor
    if (editorRef.current) {
      if (draft.htmlContent) {
        editorRef.current.innerHTML = draft.htmlContent;
      } else {
        // If no HTML content, create a basic formatted version
        editorRef.current.innerHTML = `<p>${draft.content}</p>`;
      }

      // Update content and word count
      const content = editorRef.current.innerText;
      setStoryContent(content);

      // Use the saved word count or recalculate
      if (draft.wordCount) {
        setWordCount(draft.wordCount);
      } else {
        const words = content.trim() ? content.trim().split(/\s+/) : [];
        setWordCount(words.length);
      }
    }
  };

  // Delete draft
  const handleDeleteDraft = async (draftId) => {
    if (!confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    setIsLoading(true);

    try {
      await axios.delete(route('drafts.destroy', draftId));

      // Remove the draft from the list
      setSavedDrafts(savedDrafts.filter(d => d.id !== draftId));

      // Show success message
      alert('Draft deleted successfully!');
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Failed to delete draft. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`story-modal-overlay ${show ? 'show' : ''}`}>
      <div className="story-modal-content" onClick={e => e.stopPropagation()}>
        <div className="story-modal-header">
          <h3 className="mb-0 primary-font">{story?.title}</h3>
          <button className="close-btn" onClick={onHide}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <div className="story-modal-tabs">
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="continue" className="secondry-font">Continue Story</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="drafts" className="secondry-font">My Drafts</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="published" className="secondry-font">My Published</Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          <div className="story-modal-body">
            <Tab.Content>
              <Tab.Pane eventKey="continue">
                <div className="mb-20">
                  <label className="form-label secondry-font fs-18">Select Character</label>
                  <select
                    className="form-select character-select mb-20"
                    value={selectedCharacter}
                    onChange={handleCharacterChange}
                  >
                    <option value="">Choose Character</option>
                    {story?.characters?.map(character => (
                      <option key={character.id} value={character.id}>
                        {character.name}
                      </option>
                    ))}
                  </select>

                  {characterDetails && (
                    <div className="character-details p-3 mb-3 rounded-3">
                      <h6 className="secondry-font fs-18 mb-2">{characterDetails.name}</h6>
                      <p className="fs-16 mb-0">{characterDetails.description}</p>
                    </div>
                  )}

                  {/* Rating Selection */}
                  <div className="">
                    <label className="form-label secondry-font fs-18">Content Rating</label>
                    <select
                      className="form-select rating-select"
                      value={selectedRating}
                      onChange={(e) => setSelectedRating(e.target.value)}
                    >
                      {ratingOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {/* <small className="text-muted mt-1 d-block">
                      <i className="fas fa-info-circle me-1"></i>
                      Original story rating: <strong>{story?.rating || 'Not set'}</strong>
                    </small> */}
                  </div>

                                    {/* Usage Display */}
                  {hasActiveSubscription && auth.user?.subscription?.package && (
                    <div className="usage-display p-3 mb-3 rounded-3 bg-light">
                      <h6 className="secondry-font fs-16 mb-2">
                        <i className="fas fa-chart-line me-2"></i>
                        Daily Word Usage
                      </h6>
                      <div className="row">
                        <div className="col-6">
                          <div className="usage-item">
                            <span className="usage-label">Used Today:</span>
                            <span className="usage-value">{dailyWordUsage} words</span>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="usage-item">
                            <span className="usage-label">Daily Limit:</span>
                            <span className="usage-value">{auth.user.subscription.package.words_limit} words</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="progress" style={{height: '8px'}}>
                          <div 
                            className={`progress-bar ${dailyWordUsage >= auth.user.subscription.package.words_limit ? 'bg-danger' : 'bg-success'}`}
                            style={{width: `${Math.min((dailyWordUsage / auth.user.subscription.package.words_limit) * 100, 100)}%`}}
                          ></div>
                        </div>
                        <small className="text-muted">
                          {Math.max(0, auth.user.subscription.package.words_limit - dailyWordUsage)} words remaining today
                        </small>
                      </div>
                      {wordCount > 0 && (
                        <div className="mt-2">
                          <small className={`${(dailyWordUsage + wordCount) > auth.user.subscription.package.words_limit ? 'text-danger' : 'text-success'}`}>
                            <i className={`fas fa-${(dailyWordUsage + wordCount) > auth.user.subscription.package.words_limit ? 'exclamation-triangle' : 'check-circle'} me-1`}></i>
                            This story will add {wordCount} words to your daily total
                          </small>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-20">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label secondry-font fs-18 mb-10">Your Story</label>
                    <div className="word-count">
                      <span className="fs-16 text-muted">{wordCount} words</span>
                    </div>
                  </div>
                  <div className="editor-container">
                    <div
                      ref={editorRef}
                      className="form-control story-textarea"
                      contentEditable="true"
                      placeholder="Continue the story in your own words..."
                      suppressContentEditableWarning={true}
                    ></div>
                    <div className="editor-toolbar">
                      <button type="button" className="editor-btn" onClick={() => formatText('bold')}>
                        <i className="fas fa-bold"></i>
                      </button>
                      <button type="button" className="editor-btn" onClick={() => formatText('italic')}>
                        <i className="fas fa-italic"></i>
                      </button>
                      <button type="button" className="editor-btn" onClick={() => formatText('underline')}>
                        <i className="fas fa-underline"></i>
                      </button>
                      <span className="editor-divider"></span>
                      <button type="button" className="editor-btn" onClick={() => formatText('justifyLeft')}>
                        <i className="fas fa-align-left"></i>
                      </button>
                      <button type="button" className="editor-btn" onClick={() => formatText('justifyCenter')}>
                        <i className="fas fa-align-center"></i>
                      </button>
                      <button type="button" className="editor-btn" onClick={() => formatText('justifyRight')}>
                        <i className="fas fa-align-right"></i>
                      </button>
                      <span className="editor-divider"></span>
                      <button type="button" className="editor-btn" onClick={() => formatText('insertUnorderedList')}>
                        <i className="fas fa-list-ul"></i>
                      </button>
                      <button type="button" className="editor-btn" onClick={() => formatText('insertOrderedList')}>
                        <i className="fas fa-list-ol"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subscription notice */}
                 {!hasActiveSubscription && (
                  <div className="alert alert-info mb-3" role="alert">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Subscription Required:</strong> To add stories to the community, you need an active subscription. 
                    <a href={route('packages')} className="alert-link ms-2">
                      View available packages
                    </a>
                  </div>
                )}

                <div className="d-flex justify-content-end gap-3 pb-20">
                  <button
                    className="btn btn-secondary story-btn secondry-font"
                    onClick={handleSaveDraft}
                    disabled={isLoading || !isReadyForCommunity() || !hasActiveSubscription}
                    title={!hasActiveSubscription ? 'Requires active subscription' : 'Save your story as draft'}
                  >
                    {isLoading ? <i className="fas fa-spinner fa-spin me-2"></i> : <i className="fas fa-save me-2"></i>}
                    Save Draft
                    {!hasActiveSubscription && (
                      <i className="fas fa-lock ms-2" title="Requires subscription"></i>
                    )}
                  </button>
                   <button
                    className="btn btn-success story-btn secondry-font"
                    onClick={() => handleAddToCommunity()}
                    disabled={isLoading || !isReadyForCommunity() || !hasActiveSubscription || !canAddWords()}
                    title={!hasActiveSubscription ? 'Requires active subscription' : !canAddWords() ? 'Daily word limit would be exceeded' : 'Add your story to the community'}
                  >
                    {isLoading ? <i className="fas fa-spinner fa-spin me-2"></i> : <i className="fas fa-users me-2"></i>}
                    Add to Community
                    {!hasActiveSubscription && (
                      <i className="fas fa-lock ms-2" title="Requires subscription"></i>
                    )}
                  </button>
                  <button
                    className="btn btn-primary story-btn secondry-font"
                    onClick={handlePublish}
                    disabled={isLoading || !isReadyForCommunity() || !hasActiveSubscription}
                    title={!hasActiveSubscription ? 'Requires active subscription' : 'Publish your story'}
                  >
                    {isLoading ? <i className="fas fa-spinner fa-spin me-2"></i> : <i className="fas fa-paper-plane me-2"></i>}
                    Publish
                    {!hasActiveSubscription && (
                      <i className="fas fa-lock ms-2" title="Requires subscription"></i>
                    )}
                  </button>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="drafts">
                {/* Subscription notice for drafts */}
                {!hasActiveSubscription && (
                  <div className="alert alert-info mb-3" role="alert">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Subscription Required:</strong> To add drafts to the community, you need an active subscription. 
                    <a href={route('packages')} className="alert-link ms-2">
                      View available packages
                    </a>
                  </div>
                )}

                {savedDrafts.length > 0 ? (
                  <div className="drafts-list">
                    {savedDrafts.map(draft => (
                      <div key={draft.id} className="draft-item">
                        <div className="draft-header">
                          <h5 className="secondry-font">{draft.title}</h5>
                          <span className="draft-date">{draft.date}</span>
                        </div>
                        <div className="draft-info d-flex gap-3 mb-2">
                          <div className="draft-character">
                            <i className="fas fa-user me-2"></i>
                            <span>Character: {draft.character?.name || 'Unknown'}</span>
                          </div>
                          <div className="draft-word-count">
                            <i className="fas fa-file-word me-2"></i>
                            <span>{draft.wordCount} words</span>
                          </div>
                        </div>
                        <p className="draft-preview">{draft.content.substring(0, 150)}...</p>
                        <div className="draft-actions">
                          <button
                            className="btn btn-secondary story-btn secondry-font"
                            onClick={() => handleEditDraft(draft)}
                          >
                            <i className="fas fa-edit me-1"></i> Edit
                          </button>
                          <button
                            className="btn btn-primary story-btn secondry-font"
                            onClick={() => handlePublishDraft(draft)}
                            disabled={isLoading || (!draft.content && !draft.characterId)}
                          >
                            {isLoading ? <i className="fas fa-spinner fa-spin me-1"></i> : <i className="fas fa-paper-plane me-1"></i>}
                            Publish
                          </button>
                          <button
                            className="btn btn-success story-btn secondry-font"
                            onClick={() => handleAddToCommunityFromDraft(draft)}
                            disabled={isLoading || (!draft.content && !draft.characterId) || !canAddDraftToCommunity(draft)}
                            title={!auth.user.subscription || auth.user.subscription.stripe_status !== 'active' ? 'Requires active subscription' : !canAddDraftToCommunity(draft) ? 'Daily word limit would be exceeded' : 'Add your draft to the community'}
                          >
                            {isLoading ? <i className="fas fa-spinner fa-spin me-1"></i> : <i className="fas fa-users me-1"></i>}
                            Add to Community
                            {(!auth.user.subscription || auth.user.subscription.stripe_status !== 'active') && (
                              <i className="fas fa-lock ms-1" title="Requires subscription"></i>
                            )}
                          </button>
                          <button
                            className="btn btn-sm btn-danger secondry-font"
                            onClick={() => handleDeleteDraft(draft.id)}
                            disabled={isLoading}
                          >
                            {isLoading ? <i className="fas fa-spinner fa-spin me-1"></i> : <i className="fas fa-trash me-1"></i>}
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-file-alt empty-icon"></i>
                    <h5 className="secondry-font">No Drafts Yet</h5>
                    <p>Your saved drafts will appear here</p>
                  </div>
                )}
              </Tab.Pane>

              <Tab.Pane eventKey="published">
                <div className="empty-state">
                  <i className="fas fa-book empty-icon"></i>
                  <h5 className="secondry-font">No Published Stories Yet</h5>
                  <p>Your published stories will appear here</p>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
      </div>

      {/* Limit Exceeded Modal */}
      {showLimitExceededModal && (
        <div className="limit-modal-overlay" onClick={() => setShowLimitExceededModal(false)}>
          <div className="limit-modal-content" onClick={e => e.stopPropagation()}>
            <div className="limit-modal-header">
              <h4 className="mb-0 text-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Daily Word Limit Exceeded
              </h4>
              <button className="close-btn" onClick={() => setShowLimitExceededModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="limit-modal-body">
              <div className="alert alert-warning mb-3">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Daily Word Limit Reached:</strong> You have exceeded your daily word limit of{' '}
                <strong>{auth.user?.subscription?.package?.words_limit || 0} words</strong>.
              </div>
              
              <div className="usage-info mb-3">
                <div className="row">
                  <div className="col-6">
                    <div className="usage-item">
                      <span className="usage-label">Daily Words Used:</span>
                      <span className="usage-value text-danger">{dailyWordUsage}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="usage-item">
                      <span className="usage-label">Daily Limit:</span>
                      <span className="usage-value">{auth.user?.subscription?.package?.words_limit || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="limit-modal-actions">
                <button 
                  className="btn btn-secondary me-2" 
                  onClick={() => setShowLimitExceededModal(false)}
                >
                  Close
                </button>
                <a href={route('packages')} className="btn btn-primary">
                  <i className="fas fa-arrow-up me-2"></i>
                  Upgrade Subscription
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryModal;

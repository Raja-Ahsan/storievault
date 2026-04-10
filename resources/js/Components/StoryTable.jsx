const StoryTable = ({ title, stories }) => (
  <>
    <h5 className="mb-3">{title}</h5>
    <CTable hover responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>ID</CTableHeaderCell>
          <CTableHeaderCell>Title</CTableHeaderCell>
          <CTableHeaderCell>Author</CTableHeaderCell>
          <CTableHeaderCell>Genre</CTableHeaderCell>
          <CTableHeaderCell>Type</CTableHeaderCell>
          <CTableHeaderCell>Stats</CTableHeaderCell>
          <CTableHeaderCell>Created</CTableHeaderCell>
          <CTableHeaderCell>Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {stories.length > 0 ? (
          stories.map((story) => (
            <CTableRow key={story.id}>
              <CTableHeaderCell>{story.id}</CTableHeaderCell>
              <CTableDataCell>{story.title}</CTableDataCell>
              <CTableDataCell>{story.author}</CTableDataCell>
              <CTableDataCell>{story.genre}</CTableDataCell>
              <CTableDataCell>
                <CBadge color={story.is_community ? 'info' : 'success'}>
                  {story.is_community ? 'Community' : 'Standard'}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell>
                <div className="d-flex gap-2">
                  <CBadge color="primary"><Icons.View /> {story.read_count}</CBadge>
                  <CBadge color="danger"><Icons.Like /> {story.likes_count}</CBadge>
                  <CBadge color="dark"><Icons.Comment /> {story.comment_count}</CBadge>
                </div>
              </CTableDataCell>
              <CTableDataCell>{story.created_at_formatted}</CTableDataCell>
              <CTableDataCell>
                <div className="d-flex gap-2">
                  <CTooltip content="View Story">
                    <CButton color="info" size="sm" onClick={() => router.visit(route('admin-dashboard.stories.show', story.id))}><Icons.View /></CButton>
                  </CTooltip>
                  <CTooltip content="Edit Story">
                    <CButton color="warning" size="sm" onClick={() => router.visit(route('admin-dashboard.stories.edit', story.id))}><Icons.Edit /></CButton>
                  </CTooltip>
                  <CTooltip content="Delete Story">
                    <CButton color="danger" size="sm" onClick={() => confirmDelete(story)}><Icons.Delete /></CButton>
                  </CTooltip>
                  {story.is_community && story.status === 'pending' && (
                    <>
                      <CTooltip content="Approve Story">
                        <CButton color="success" size="sm" onClick={() => router.post(route('admin-dashboard.stories.approve', story.id))}>✅</CButton>
                      </CTooltip>
                      <CTooltip content="Reject Story">
                        <CButton color="warning" size="sm" onClick={() => router.post(route('admin-dashboard.stories.reject', story.id))}>❌</CButton>
                      </CTooltip>
                    </>
                  )}
                </div>
              </CTableDataCell>
            </CTableRow>
          ))
        ) : (
          <CTableRow>
            <CTableDataCell colSpan="8" className="text-center">No stories found</CTableDataCell>
          </CTableRow>
        )}
      </CTableBody>
    </CTable>
  </>
)

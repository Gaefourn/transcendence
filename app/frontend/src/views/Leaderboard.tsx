import React, {CSSProperties, useRef, useState} from 'react';

import {User} from 'store/types/user';
import {useGetLeaderboardQuery} from 'store/api';
import {styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField} from '@mui/material';
import Avatars from 'components/Avatars';


const styles: Record<string, CSSProperties> = {
  top: {
    border: '1px solid orange',
    borderRadius: '8px 8px 0px 0px',
    fontSize: 32,
    textAlign: 'center',
    color: 'orange',
    padding: '16px',
    margin: '16px 0px 0px 0px',
    backgroundColor: '#282C34'
  },
  content: {
    overflow: 'hidden',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '70%',
    margin: '16px auto'
  },
  cell: {
    display: 'flex',
    alignItems: 'center'
  },
  avatar: {
    paddingRight: '8px'
  },
  sep: {
    height: '100%'
  },
  searchBar: {
    display: 'flex',
    marginTop: 16,
    backgroundColor: '#36393F',
    flexShrink: 0,
  }
}

const HeaderCell = styled(TableCell)(theme => ({
  '&': {
    fontWeight: 'bold',
    fontSize: 24,
    backgroundColor: '#36393F',
    width: '8%',
  },
  '&:nth-of-type(3)': {
    width: '64%',
  },
  '&:nth-of-type(4)': {
    width: '20%',
  }
}));

const Cell = styled(TableCell)(theme => ({
  '&': {
    fontSize: 16
  }
}));

type Props = {
  user: User;
  rank: number;
}

const TableContent: React.FC<Props> = ({ user, rank }) => {
  return <TableRow style={styles.row}>
      <Cell sx={{ textAlign: 'center' }}>{rank}</Cell>
      <Cell sx={{ textAlign: 'center' }}>{user.rating}</Cell>
      <Cell>
        <div style={styles.cell}><Avatars style={{ marginRight: '8px' }} id={user.avatar_id}/>{user.username}</div>
      </Cell>
    <Cell sx={{ textAlign: 'center', textTransform: 'uppercase' }}>{user.win_number} games won</Cell>
  </TableRow>
}

const Leaderboard: React.FC = () => {
  const {data: users = [] } = useGetLeaderboardQuery({}, { refetchOnMountOrArgChange: true });
  const [search, setSearch] = useState('');
  const container = useRef<HTMLDivElement>(null);

  const rows = users.filter(e => !search || e.username.toLowerCase().includes(search.toLowerCase()));

  return <div style={styles.content} ref={container}>
      <div style={styles.top}>Top 100</div>
      <TableContainer sx={{ flex: 1, minHeight: 0, backgroundColor: '#36393F' }}>
        <Table stickyHeader>
          <TableHead style={styles.row}>
            <TableRow>
              <HeaderCell sx={{ textAlign: 'center' }}>Rank</HeaderCell>
              <HeaderCell sx={{ textAlign: 'center' }}>Score</HeaderCell>
              <HeaderCell />
              <HeaderCell align='right' />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((user, index) => <TableContent key={user.id + index} rank={index + 1} user={user}/>)}
          </TableBody>
        </Table>
      </TableContainer>
      <TextField style={styles.searchBar} type="text" placeholder="Search..." onChange={event => {setSearch(event.target.value)}} size={"small"}/>
    </div>
}

export default Leaderboard;

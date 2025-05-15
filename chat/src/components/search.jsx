import React, { useEffect, useState } from 'react';
import './search.css';
import NotificationDrawer from './notifications';

function Search({ changePerson, user }) {
    const [people, setPeople] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [username, setUsername] = useState('');
    const [tmp, setTmp] = useState(null); 

    const fetchPeople = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/people', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: user }), 
            });

            if (!response.ok) {
                throw new Error('Failed to fetch people');
            }

            const data = await response.json();
            setPeople(data); 
            setLoading(false);
        } catch (error) {
            console.error('Error fetching people:', error.message);
            setError(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPeople();
    }, [user]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true); 
        setTmp(null); 

        try {
            const response = await fetch('http://localhost:5000/api/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                throw new Error('Failed to search for user');
            }

            const data = await response.json();
            if (data.found) {
                setTmp({ id: data.id, name: username });
                
            } else {
                setError('User not found');
            }
        } catch (error) {
            setError('Error searching for user');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    // if (error) {
    //     return <div>Error: {error}</div>;
    // }

    return (
        <div className='Wrapper2'>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <h1 style={{ color: 'white', margin: '5px' }}>Contacts</h1>
                <NotificationDrawer user={user} />
            </div>
            <form onSubmit={handleSearch}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search by Username"
                        className="Search"
                        name="username"
                        style={{ borderRadius: '5px', width: '75%', marginLeft: '2%' }}
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value); 
                            setTmp(null); 
                        }}
                    />
                    <button type="submit" style={{ height: '50%', marginLeft: '8%' }}>Search</button>
                </div>
            </form>
            <hr />
            {tmp ? (
                <button
                    className="personList"
                    onClick={() => changePerson(tmp.name)}
                >
                    {tmp.name}
                </button>
            ) : (
                people.map((person) => (
                    <button
                        key={person.id} 
                        className="personList"
                        onClick={() => changePerson(person.name)} 
                    >
                        {person.name}
                    </button>
                ))
            )}
        </div>
    );
}

export default Search;
